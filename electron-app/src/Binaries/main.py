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

# Mood imports to log for graphs
import json
from datetime import datetime
from memory import get_relevant_memories_general, get_relevant_memories_core, add_memory_core, add_memory_general, load_memories_core, load_memories_general

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

class QueryRequest(BaseModel): # Request structure for FastAPI
    question: str
    context: str = ""
    model: str = "gemma3n:e2b"  # Default model with fallback
    
class MoodRequest(BaseModel):
    graph: int


class customhandler(StreamingStdOutCallbackHandler):
    def __init__(self):
        self.buffer = ""
        super().__init__()
        self.queue = asyncio.Queue() # Initializing an asyncio queue to handle tokens
        self.streaming_enabled = True # Flag to control streaming

    async def on_llm_new_token(self, token: str, **kwargs)-> None:
        if self.streaming_enabled:
            print(token, end= "", flush=True)
            self.buffer += token
            await self.queue.put(token) # Adding Token to the queue for FastApi Processing
        #if self.buffer.endswith(('.', '!', '?')) and len(self.buffer.strip().split()) >= 4: # Added Minor space to fix sentence processing error
            #synthesis(self.buffer)
            #self.buffer = ""
            
    async def token_stream(self):
        while True:
            token = await self.queue.get()
            if token == "[END]":
                break
            yield token.encode("utf-8")

# Main Code
app = FastAPI() # Initializing FastAPI app

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Or ["http://localhost:5173"] for stricter control
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Template for the AI assistant
template = """
You are GemmaTalk, a positive, friendly, and knowledgeable AI assistant created by Mirang Bhandari (a male human). Your purpose is to support and uplift the user at all times, especially during tough situations. Always highlight the positive side and reassure the user, no matter how bad things seem. Be helpful, kind, and encouraging in every response.

Please keep the responses concise and to the point, while still being supportive and positive.

Conversation history: {context}
User message: {question}

Your reply:
"""

# Create prompt template once (reusable)
prompt = ChatPromptTemplate.from_template(template)

# New mood analysis components
mood_template = """
Analyze the user's emotional tone from the following message and respond with a single digit: 0 for happy, 1 for sad, or 2 for neutral. Do not provide any other text or explanation.

User message: {question}

Your response:
"""
mood_prompt = ChatPromptTemplate.from_template(mood_template)

async def analyze_and_log_mood(question: str, model: OllamaLLM, handler: customhandler):
    try:
        handler.streaming_enabled = False # Disable streaming for mood analysis
        chain = mood_prompt | model
        
        # Get the mood analysis result
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        
        # The result should be a string like "0", "1", or "2"
        mood_str = result.strip()
        current_mood = None # Initialize current_mood
        if mood_str in ["0", "1", "2"]:
            current_mood = int(mood_str)
            await log_mood(current_mood)
        else:
            logging.warning(f"Mood analysis returned an unexpected value: {mood_str}")
        return current_mood # Return the mood
    except Exception as e:
        logging.error(f"Error during mood analysis: {str(e)}")
        return None # Return None on error
    finally:
        handler.streaming_enabled = True # Re-enable streaming

# Function to check for positive memories
async def is_positive(question: str, model: OllamaLLM, handler: customhandler):
    """Analyzes if the user's message is positive."""
    try:
        handler.streaming_enabled = False  # Disable streaming for analysis
        # A simple prompt to classify the message
        positive_template = """
Analyze the user's message and determine if it's a positive memory worth remembering.
Respond with 'yes' if it is, and 'no' if it is not. Do not provide any other text or explanation.

User message: {question}

Your response:
"""
        positive_prompt = ChatPromptTemplate.from_template(positive_template)
        chain = positive_prompt | model
        
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        
        return result.strip().lower() == 'yes'
    except Exception as e:
        logging.error(f"Error during positivity analysis: {str(e)}")
        return False
    finally:
        handler.streaming_enabled = True

@app.post("/stream")
async def query_stream(request: Request):
    data = await request.json()
    parsed = QueryRequest(**data)
    
    # Create a new handler instance for each request to avoid conflicts
    handler = customhandler()
    
    # Create model instance with the selected model for this request
    model = OllamaLLM(
        model=parsed.model, 
        streaming=True, 
        callbacks=[handler]
    )
    
    # Create chain with the selected model
    chain = prompt | model

    # Create Async Fucntions to pull and list ollama models via subprocess
    async def download_model_background(model_name, handler):
            subprocess.run(['ollama', 'pull', model_name], creationflags=subprocess.CREATE_NEW_CONSOLE)
            await handler.queue.put("Download completed!")
                
    async def check_model():
        model_check = subprocess.run(['ollama', 'list'], capture_output=True, text=True)
        return model_check
    
    async def is_valid(question: str, model: OllamaLLM, handler: customhandler):
        """Analyzes if the user's message is valid for memory and returns structured metadata."""
        try:
            handler.streaming_enabled = False

            # 💡 Strict prompt for reliable formatting
            valid_prompt = ChatPromptTemplate.from_template("""
            You are a memory filter AI.

            Your task is to determine if the user's message contains any factual, personal, or goal-related information that should be stored in memory.

            Respond strictly in this format:
            validity: true/false
            type: <category like name, location, goal, preference>
            value: <summarized version of the message, clearly expressed as a fact>

            Examples:
            User: I am Hrithik  
            → validity: true  
            → type: name  
            → value: The user's name is Hrithik.

            User: I like biryani  
            → validity: true  
            → type: preference  
            → value: The user likes biryani.

            User: What is my name?  
            → validity: false

            Now analyze the user's message below:
            User message: {question}
            """)

            chain = valid_prompt | model

            # Run inference in separate thread
            result = await asyncio.to_thread(chain.invoke, {"question": question})

            lines = result.strip().splitlines()
            validity = False
            mem_type = ""
            value = ""

            for line in lines:
                if line.lower().startswith("validity:"):
                    validity = "true" in line.lower()
                elif line.lower().startswith("type:"):
                    mem_type = line.split(":", 1)[-1].strip()
                elif line.lower().startswith("value:"):
                    value = line.split(":", 1)[-1].strip()

            return validity, mem_type, value

        except Exception as e:
            logging.error(f"[is_valid error] {e}")
            return False, "", ""
        finally:
            handler.streaming_enabled = True

    async def run_chain_and_analyze_mood():
        try:
            # Analyze mood first
            current_mood = await analyze_and_log_mood(parsed.question, model, handler)

            # Always load core memories
            core_memories = get_relevant_memories_core(parsed.question)
            core_context = "\n".join([mem['memory'] for mem in core_memories])

            context = core_context
            if current_mood == 1:  # If mood is sad (1)
                relevant_memories = get_relevant_memories_core(parsed.question)
                context += "\n" + "\n".join([mem['memory'] for mem in relevant_memories])
            else: # For neutral or happy moods, use general memories
                relevant_memories = get_relevant_memories_general(parsed.question)
                context += "\n" + "\n".join([mem['memory'] for mem in relevant_memories])

            await asyncio.to_thread(chain.invoke, {
                "context": context,
                "question": parsed.question
            })

            # Check if the conversation is positive and save it as a mood memory
            if await is_positive(parsed.question, model, handler):
                add_memory_core(parsed.question)
            
            # Always add the user's question as a general memory
            valid, mem_type, value = await is_valid(parsed.question, model, handler)
            if valid and value:
                add_memory_general(value)
                
        except Exception as e:
            # Main Code for Calling async functions
            logging.error(f"Chain invoke error: {str(e)}")

            # Check if model exists locally
            model_check = await check_model() # call async function

            if parsed.model not in model_check.stdout:
                # Call CMD to pull the required moded
                await handler.queue.put("Model not found locally. Downloading the model, please wait... (Check the command window for progress)")
                asyncio.create_task(download_model_background(parsed.model, handler))
            else:
                await handler.queue.put(f"Error: {str(e)}")
           
        finally:
            await handler.queue.put("[END]")

    asyncio.create_task(run_chain_and_analyze_mood())

    return StreamingResponse(handler.token_stream(), media_type="text/plain")

# Health check endpoint to verify available models
@app.get("/models")
async def get_available_models():
    """Returns list of available models"""
    return {
        "available_models": [
            "llama3.2",
            "mistral", 
            "gemma2:2b"
        ]
    }
    
@app.post("/mood")
async def post_mood(data: MoodRequest):
    await log_mood(data.graph)
    return {"mood": data.graph}

@app.get("/mood")
async def get_mood():
    try:
        with open("mood_log.json", "r") as f:
            mood_entries = json.load(f)
        return JSONResponse(content=mood_entries)
    except (FileNotFoundError, json.JSONDecodeError):
        return JSONResponse(content=[])

@app.get("/core_memory")
async def get_memory():
    """Returns all core memories."""
    return JSONResponse(content=load_memories_core())

@app.get("/general_memory")
async def get_mood_memory():
    """Returns all general memories."""
    return JSONResponse(content=load_memories_general())


# Added Main Block for running FastApi Server in Production when turned to .exe
if __name__ == "__main__":
    import uvicorn
    logging.basicConfig(level=logging.INFO)
    logger = logging.getLogger(__name__)
    try:
        logger.info("Starting ISAC FastAPI server...")
        uvicorn.run("main:app", 
            host="127.0.0.1",
            port=8000,
            reload=False
        )
    except Exception as e:
        print(f"Server error: {str(e)}")
        logger.error(f"Server error: {str(e)}")

#@app.post("/query") # Legacy code for Complete output
#async def query(request:QueryRequest):
    #result = chain.invoke({"context" : request.context, "question" : request.question})
    #return {"response":str(result)}

# --- Old Code for CLI Inference---
#pointer = True
#while pointer!= False:           # Loop Chat and inference with model until i say exit
    #prompt = ChatPromptTemplate.from_template(template)
    #chain = prompt | model
    #query = input("Query: ")

    #if 'exit' in query.lower():
        #pointer = False

    #print("ISAC:", end=" ", flush=True) # Moved Print statement here due to incorrect CLI placement and used flush for immediate printing
    #result = chain.invoke({"context" : "", "question" : query})
    #synthesis(result)
    #print("")

