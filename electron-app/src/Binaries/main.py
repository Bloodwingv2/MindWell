# Importing necessary libraries for LLM, Ollama and Speech Synthesis
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
#from Binaries.xtts import synthesis

# Importing necessary libraries for LLM and FastAPI
from fastapi import FastAPI, Request # FastApi Libraries for Inference
from pydantic import BaseModel # Importing necessary libraries for FastApi
from fastapi.responses import StreamingResponse # importing StreamingResponse from FastAPi
from fastapi.responses import JSONResponse # Importing JSONResponse for returning JSON data
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import subprocess for model download
import subprocess
import os
import re


# Mood imports to log for graphs
import json
from datetime import datetime
from memory import add_special_memory_core, load_memories_special, get_relevant_special_memories_core, get_relevant_memories_general, get_relevant_memories_core, add_memory_core, add_memory_general, load_memories_core, load_memories_general

# Import string formatters
from titlecase import titlecase


# --- Configuration ---
CONVERSATION_BUFFER_FILE = "conversation_buffer.json"

# --- Helper Functions ---
async def log_mood(mood: int):
    entry = {"mood": mood, "timestamp": datetime.now().isoformat()}
    try:
        with open("mood_log.json", "r+") as f:
            data = json.load(f)
            data.append(entry)
            f.seek(0)
            json.dump(data, f, indent=4)
    except (FileNotFoundError, json.JSONDecodeError):
        with open("mood_log.json", "w") as f:
            json.dump([entry], f, indent=4)

async def save_to_buffer(question: str, response: str):
    entry = {"question": question, "response": response, "timestamp": datetime.now().isoformat()}
    try:
        # Read existing data
        try:
            with open(CONVERSATION_BUFFER_FILE, "r") as f:
                data = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            data = []
        
        # Append new entry and write back
        data.append(entry)
        with open(CONVERSATION_BUFFER_FILE, "w") as f:
            json.dump(data, f, indent=4)
    except Exception as e:
        logging.error(f"Error saving to conversation buffer: {e}")

class QueryRequest(BaseModel): # Request structure for FastAPI
    question: str
    context: str = ""
    model: str = "gemma3n:e2b"  # Default model with fallback
    language: str = "en" # Default to English
    
class MoodRequest(BaseModel):
    graph: int

class customhandler(StreamingStdOutCallbackHandler):
    def __init__(self):
        self.buffer = ""
        super().__init__()
        self.queue = asyncio.Queue() # Initializing an asyncio queue to handle tokens

    async def on_llm_new_token(self, token: str, **kwargs)-> None:
        print(token, end= "", flush=True)
        self.buffer += token
        await self.queue.put(token) # Adding Token to the queue for FastApi Processing
            
    async def token_stream(self):
        while True:
            token = await self.queue.get()
            if token == "[END]":
                break
            yield token.encode("utf-8")

# --- FastAPI App Initialization ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Prompt Templates ---
template = """
You are GemmaTalk, a positive, friendly, and knowledgeable AI assistant created by Mirang Bhandari (a male human). Your purpose is to support and uplift the user at all times, especially during tough situations. Always highlight the positive side and reassure the user, no matter how bad things seem. Be helpful, kind, and encouraging in every response. Respond in {language} language.

Please keep the responses concise and to the point, while still being supportive and positive.

Conversation history: {context}
User message: {question}

Your reply:
"""
prompt = ChatPromptTemplate.from_template(template)

# --- Analysis Functions (for background processing) ---
async def analyze_and_log_mood(question: str, model: OllamaLLM):
    mood_template = """
Analyze the user's emotional tone from the following message and respond with a single digit: 0 for happy, 1 for sad, or 2 for neutral. Do not provide any other text or explanation.
User message: {question}
Your response:
"""
    mood_prompt = ChatPromptTemplate.from_template(mood_template)
    try:
        chain = mood_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        mood_str = result.strip()
        if mood_str in ["0", "1", "2"]:
            await log_mood(int(mood_str))
    except Exception as e:
        logging.error(f"Error during mood analysis: {str(e)}")

async def is_positive(question: str, model: OllamaLLM):
    positive_template = """Analyze the user's message and determine if it's a special positive memory worth remembering.
Respond with 'special: <title>' if it is, 'yes' if it is just a positive memory and 'no' if none of the above. Do not provide any other text or explanation.
User message: {question}
Your response:
"""
    positive_prompt = ChatPromptTemplate.from_template(positive_template)
    try:
        chain = positive_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        return result.strip().lower()
    except Exception as e:
        logging.error(f"Error during positivity analysis: {str(e)}")
        return "no"


async def download_model_background(model_name, handler):
    
    process = await asyncio.create_subprocess_exec(
        "ollama", "pull", model_name,
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.STDOUT
    )

    progress_pattern = re.compile(r"(\w+):\s+(\d+)%|(\w+)\s+([\d.]+)\s+(\w+)/([\d.]+)\s+(\w+)\s+\((.+)\)")

    while True:
        line = await process.stdout.readline()
        if not line:
            break
        decoded = line.decode("utf-8", errors="replace").strip()
        
        match = progress_pattern.match(decoded)
        if match:
            if match.group(1) and match.group(2):  # e.g., "downloading: 10%"
                status = match.group(1)
                percentage = match.group(2)
                formatted_output = f"Model download {status}: {percentage}%"
            elif match.group(3) and match.group(4) and match.group(5) and match.group(6) and match.group(7) and match.group(8): # e.g., "verifying 1.2 GB/1.2 GB (overall 100%)"
                status = match.group(3)
                downloaded_size = match.group(4)
                downloaded_unit = match.group(5)
                total_size = match.group(6)
                total_unit = match.group(7)
                overall_progress = match.group(8)
                formatted_output = f"Model {status}: {downloaded_size} {downloaded_unit}/{total_size} {total_unit} ({overall_progress})"
            else:
                formatted_output = decoded # Fallback to raw if no match
        else:
            formatted_output = decoded # Fallback to raw if no match

        await handler.queue.put(formatted_output + "\n") # Add newline for better display

                
async def check_model():
    proc = await asyncio.create_subprocess_exec(
        "ollama", "list",
        stdout=asyncio.subprocess.PIPE,
        stderr=asyncio.subprocess.PIPE
    )
    stdout, stderr = await proc.communicate()
    return stdout.decode().strip()

async def is_valid(question: str, model: OllamaLLM):
    valid_prompt = ChatPromptTemplate.from_template("""
    You are a memory filter AI.
    Your task is to determine if the user's message contains any factual, personal, or goal-related information that should be stored in memory.
    Respond strictly in this format:
    validity: true/false
    type: <category like name, location, goal, preference>
    value: <summarized version of the message, clearly expressed as a fact>
    User message: {question}
    """)
    try:
        chain = valid_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        lines = result.strip().splitlines()
        validity = "true" in (lines[0] if lines else "")
        mem_type = lines[1].split(":", 1)[-1].strip() if len(lines) > 1 else ""
        value = lines[2].split(":", 1)[-1].strip() if len(lines) > 2 else ""
        return validity, mem_type, value
    except Exception as e:
        logging.error(f"[is_valid error] {e}")
        return False, "", ""

async def today_generate(question: str, model: OllamaLLM):
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_filename = f"today_summary_{today_str}.json"
    # ... (rest of the function is complex and remains the same, just without handler)
    try:
        script_dir = os.path.dirname(os.path.abspath(__file__))
        today_filename = os.path.join(script_dir, f"today_summary_{today_str}.json")
        for f in os.listdir(script_dir):
            if f.startswith("today_summary_") and f.endswith(".json") and f != os.path.basename(today_filename):
                os.remove(os.path.join(script_dir, f))
        existing_context = ""
        if os.path.exists(today_filename):
            with open(today_filename, "r") as f:
                existing_data = json.load(f)
                if existing_data:
                    existing_summary = existing_data[0].get("summary", "")
                    existing_tips = existing_data[0].get("tips", "")
                    existing_context = f"### Summary\n{existing_summary}\n\n### Tips\n{existing_tips}"
        prompt_template = ChatPromptTemplate.from_template("""
        You are an assistant that provides a short, structured summary of a mental health conversation, followed by actionable tips.
        Context (if any): {existing_context}
        User: {question}
        Respond in this format:
        ### Summary
        <Concise summary here>
        ### Tips
        - Tip 1
        - Tip 2
        - Tip 3
        """)
        chain = prompt_template | model
        result = await asyncio.to_thread(chain.invoke, {"existing_context": existing_context, "question": question })
        parts = result.strip().split("### Tips", maxsplit=1)
        summary_part = parts[0].replace("### Summary", "").replace("*", "").strip() if len(parts) > 0 else ""
        tips_part = parts[1].replace("*", "").strip() if len(parts) > 1 else ""
        entry = {"summary": summary_part, "tips": tips_part}
        with open(today_filename, "w") as f:
            json.dump([entry], f, indent=4)
    except Exception as e:
        logging.error(f"[today_generate error] {e}")


# --- API Endpoints ---

@app.post("/stream")
async def query_stream(request: Request):
    data = await request.json()
    parsed = QueryRequest(**data)
    handler = customhandler()
    model = OllamaLLM(model=parsed.model, streaming=True, callbacks=[handler])
    chain = prompt | model

    async def run_chain_and_save():
        try:
            core_memories = get_relevant_memories_core(parsed.question)
            general_memories = get_relevant_memories_general(parsed.question)
            special_memories = get_relevant_special_memories_core(parsed.question)
            context = "\n".join([mem['memory'] for mem in core_memories + general_memories + special_memories])
            
            await asyncio.to_thread(chain.invoke, {
                "context": context,
                "question": parsed.question,
                "language": parsed.language
            })

            # After generation, save to buffer
            await save_to_buffer(parsed.question, handler.buffer)
                
        except Exception as e:
            # Main Code for Calling async functions
            logging.error(f"Chain invoke error: {str(e)}")

            # Check if model exists locally
            model_list = await check_model()
            logging.info(f"Installed models:\n{model_list}")

            model_names = [line.split()[0].lower() for line in model_list.splitlines()[1:] if line.strip()]
            if parsed.model.lower() not in model_names:
                await handler.queue.put("Model not found locally. Downloading the model, please wait...")
                await download_model_background(parsed.model, handler)
            else:
                await handler.queue.put(f"Error: {str(e)}")
        
        finally:
            await handler.queue.put("[END]")

    asyncio.create_task(run_chain_and_save())
    return StreamingResponse(handler.token_stream(), media_type="text/plain")

@app.post("/process_conversations")
async def process_conversations():
    try:
        try:
            with open(CONVERSATION_BUFFER_FILE, "r") as f:
                conversations = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            return JSONResponse(content={"message": "Buffer is empty or not found."}, status_code=200)

        if not conversations:
            return JSONResponse(content={"message": "Buffer is empty."}, status_code=200)

        # Use the default model for analysis to conserve VRAM
        analysis_model = OllamaLLM(model="gemma3n:e2b")

        for conv in conversations:
            question = conv.get("question")
            if not question:
                continue
            
            await analyze_and_log_mood(question, analysis_model)
            result = await is_positive(question, analysis_model)
            
            if result.startswith("special:"):
                title = result.split(":", 1)[1].strip()
                title = title.title()
                add_special_memory_core(question, title)
            elif result == "yes":
                add_memory_core(question)
            
            valid, mem_type, value = await is_valid(question, analysis_model)
            if valid and value:
                add_memory_general(value)

            await today_generate(question, analysis_model)

        # Clear the buffer after processing
        with open(CONVERSATION_BUFFER_FILE, "w") as f:
            json.dump([], f)

        return JSONResponse(content={"message": f"Successfully processed {len(conversations)} conversations."}, status_code=200)

    except Exception as e:
        logging.error(f"Error processing buffer: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

# --- Other Endpoints (Mood, Memory, etc.) ---

@app.get("/models")
async def get_available_models():
    return {"available_models": ["gemma3n:e2b", "mistral", "gemma2:2b"]}
    
@app.post("/mood")
async def post_mood_data_json(data: MoodRequest):
    await log_mood(data.graph)
    return {"mood": data.graph}

@app.get("/mood")
async def get_mood_graph_value():
    try:
        with open("mood_log.json", "r") as f:
            return JSONResponse(content=json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return JSONResponse(content=[])

@app.get("/core_memory")
async def get_memory():
    return JSONResponse(content=load_memories_core())

@app.get("/special_memory")
async def get_special_memory():
    return JSONResponse(content=load_memories_special())

@app.get("/general_memory")
async def get_mood_memory():
    return JSONResponse(content=load_memories_general())

@app.get("/mood_summary")
async def get_mood_summary():
    today_str = datetime.now().strftime("%Y-%m-%d")
    today_filename = f"today_summary_{today_str}.json"
    try:
        with open(today_filename, "r") as f:
            return JSONResponse(content=json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return JSONResponse(content=[])

# --- Main Execution Block ---
if __name__ == "__main__":
    import uvicorn
    logging.basicConfig(level=logging.INFO)
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=False)

