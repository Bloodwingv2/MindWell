# Importing necessary libraries for LLM, Ollama and Speech Synthesis
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler

# Importing necessary libraries for LLM and FastAPI
from fastapi import FastAPI, Request
from fastapi.responses import FileResponse
import pandas as pd
import io
from pydantic import BaseModel
from fastapi.responses import StreamingResponse
from fastapi.responses import JSONResponse
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import subprocess for model download
import os
import re
from memory import init_db
import sqlite3
import socket

# Mood imports to log for graphs
import json
from datetime import datetime
from memory import (
    add_special_memory, load_memories_special, get_relevant_special_memories,  
    add_to_buffer, get_unread_buffer, delete_processed_buffer,
    get_today_summary, upsert_today_summary,
    update_special_memory, delete_special_memory
)

# Import string formatters
from titlecase import titlecase

# Language detection
from langdetect import detect
import langdetect

# Context manager for lifespan events
from contextlib import asynccontextmanager

# --- Configuration ---
# Global model instances for efficiency - support both streaming and non-streaming
_model_instances = {}  # Cache multiple models with different configurations
_model_lock = asyncio.Lock()

# Language code mapping
LANGUAGE_NAMES = {
    'en': 'English',
    'es': 'Spanish',
    'fr': 'French',
    'de': 'German',
    'zh': 'Chinese (Simplified)',
    'ja': 'Japanese',
    'ko': 'Korean',
    'pt': 'Portuguese',
    'ru': 'Russian',
    'ar': 'Arabic',
    'hi': 'Hindi',
    'it': 'Italian',
    'nl': 'Dutch',
    'sv': 'Swedish',
    'tr': 'Turkish',
    'pl': 'Polish',
    'vi': 'Vietnamese',
    'th': 'Thai',
    'id': 'Indonesian',
    'tl': 'Filipino (Tagalog)'
}

DEFAULT_LANGUAGE = 'en'  # Default fallback
SETTINGS_FILE = os.path.join(os.path.dirname(__file__), "settings.json")

def load_settings():
    """Load settings from file"""
    global DEFAULT_LANGUAGE
    try:
        if os.path.exists(SETTINGS_FILE):
            with open(SETTINGS_FILE, 'r') as f:
                settings = json.load(f)
                DEFAULT_LANGUAGE = settings.get('defaultlang', 'en')
    except Exception as e:
        logging.error(f"Error loading settings: {e}")

def save_settings(settings):
    """Save settings to file"""
    try:
        with open(SETTINGS_FILE, 'w') as f:
            json.dump(settings, f)
    except Exception as e:
        logging.error(f"Error saving settings: {e}")

# --- Helper Functions ---
async def get_model_instance(model_name: str = "gemma3n:e2b", streaming: bool = False, callbacks: list = None):
    """Get or create cached model instances for better performance"""
    global _model_instances
    
    # Create unique cache key based on model name and streaming capability
    cache_key = f"{model_name}_{streaming}"
    
    async with _model_lock:
        if cache_key not in _model_instances:
            _model_instances[cache_key] = OllamaLLM(
                model=model_name,
                streaming=streaming
            )
            logging.info(f"Created new model instance: {cache_key}")
        
        model = _model_instances[cache_key]
        
        # Set callbacks if provided (for streaming)
        if callbacks is not None:
            model.callbacks = callbacks
        
        return model

def detect_language(text: str) -> str:
    """Detect language of text with fallback to English"""
    try:
        detected = detect(text)
        return detected if detected in LANGUAGE_NAMES else 'en'
    except (langdetect.lang_detect_exception.LangDetectException, Exception):
        return 'en'

def get_language_name(code: str) -> str:
    """Get full language name from code"""
    return LANGUAGE_NAMES.get(code, 'English')

async def log_mood(mood: int):
    """Log mood with better error handling"""
    entry = {"mood": mood, "timestamp": datetime.now().isoformat()}
    try:
        if os.path.exists("mood_log.json"):
            with open("mood_log.json", "r+", encoding='utf-8') as f:
                try:
                    data = json.load(f)
                except json.JSONDecodeError:
                    data = []
                data.append(entry)
                f.seek(0)
                f.truncate()
                json.dump(data, f, indent=4, ensure_ascii=False)
        else:
            with open("mood_log.json", "w", encoding='utf-8') as f:
                json.dump([entry], f, indent=4, ensure_ascii=False)
    except Exception as e:
        logging.error(f"Error logging mood: {e}")

class QueryRequest(BaseModel):
    question: str
    userName: str = "User"
    context: str = ""
    model: str = "gemma3n:e2b"
    language: str = ""  # Auto-detect if empty
    
class MoodRequest(BaseModel):
    graph: int

class MemoryUpdateRequest(BaseModel):
    id: int
    memory: str
    table: str

class SpecialMemoryUpdateRequest(BaseModel):
    id: int
    title: str
    memory: str

class MemoryDeleteRequest(BaseModel):
    id: int
    table: str

class CustomHandler(StreamingStdOutCallbackHandler):
    def __init__(self):
        self.buffer = ""
        super().__init__()
        self.queue = asyncio.Queue()
        self._finished = False

    async def on_llm_new_token(self, token: str, **kwargs) -> None:
        self.buffer += token
        await self.queue.put(token)
            
    async def token_stream(self):
        while True:
            try:
                token = await asyncio.wait_for(self.queue.get(), timeout=30.0)
                if token == "[END]":
                    break
                # Fix UTF-8 encoding for streaming
                yield f"data: {token}\n\n".encode("utf-8")
            except asyncio.TimeoutError:
                break
            except Exception as e:
                logging.error(f"Streaming error: {e}")
                break

# --- Lifespan Event Handler ---
from contextlib import asynccontextmanager

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    logging.info("Starting up FastAPI application")
    load_settings()  # Load settings on startup
    yield
    # Shutdown
    global _model_instances
    async with _model_lock:
        _model_instances.clear()
        logging.info("Cleared all model instances on shutdown")

# --- FastAPI App Initialization ---
app = FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Prompt Templates ---
template = """
You are Mindwell, a positive, friendly, and knowledgeable AI assistant created by Mirang Bhandari (a male human). Your purpose is to support and uplift the user at all times, especially during tough situations. Always highlight the positive side and reassure the user, no matter how bad things seem. Be helpful, kind, and encouraging in every response.

The user is communicating in {language_name} (language code: {language}). Your response **must** be in {language_name}.

Use the conversation history **only if** the user appears sad, frustrated, anxious, or emotionally down. If the message is neutral or positive, **ignore the context completely**.

Please keep the responses concise and to the point, while still being supportive and positive.

Conversation history: {context}
User message: {question}

Your reply (in {language_name}):
"""
prompt = ChatPromptTemplate.from_template(template)

# --- Analysis Functions (for background processing) ---
async def analyze_and_log_mood(question: str, language: str):
    """Improved mood analysis with multilingual support and cached model"""
    language_name = get_language_name(language)
    mood_template = f"""
Analyze the user's emotional tone from the following message in {language_name} and respond with a single digit: 0 for happy, 1 for sad, or 2 for neutral. Do not provide any other text or explanation.

User message: {{question}}
Your response:
"""
    mood_prompt = ChatPromptTemplate.from_template(mood_template)
    try:
        # Use cached non-streaming model instance
        model = await get_model_instance("gemma3n:e2b", streaming=False)
        chain = mood_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        
        # More robust parsing
        mood_str = str(result).strip()
        # Extract only digits
        digits = re.findall(r'\d', mood_str)
        if digits and digits[0] in ["0", "1", "2"]:
            await log_mood(int(digits[0]))
            logging.info(f"Mood logged: {digits[0]} for language: {language_name}")
        else:
            logging.warning(f"Invalid mood result: {mood_str}")
    except Exception as e:
        logging.error(f"Error during mood analysis: {str(e)}")

async def is_positive(question: str, language: str):
    """Improved positivity analysis with multilingual support and cached model"""
    language_name = get_language_name(language)
    positive_template = f"""Analyze the user's message in {language_name} and determine if it's a special positive memory worth remembering.
Respond with 'special: <title>' in {language_name} if it is, 'yes' if it is just a positive memory and 'no' if none of the above. Do not provide any other text or explanation.

User message: {{question}}
Your response:
"""
    positive_prompt = ChatPromptTemplate.from_template(positive_template)
    try:
        # Use cached non-streaming model instance
        model = await get_model_instance("gemma3n:e2b", streaming=False)
        chain = positive_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        return str(result).strip().lower()
    except Exception as e:
        logging.error(f"Error during positivity analysis: {str(e)}")
        return "no"

async def download_model_background(model_name, handler):
    """Improved model download with better progress tracking"""
    try:
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
                if match.group(1) and match.group(2):
                    status = match.group(1)
                    percentage = match.group(2)
                    formatted_output = f"Model download {status}: {percentage}%"
                elif match.group(3) and match.group(4) and match.group(5) and match.group(6) and match.group(7) and match.group(8):
                    status = match.group(3)
                    downloaded_size = match.group(4)
                    downloaded_unit = match.group(5)
                    total_size = match.group(6)
                    total_unit = match.group(7)
                    overall_progress = match.group(8)
                    formatted_output = f"Model {status}: {downloaded_size} {downloaded_unit}/{total_size} {total_unit} ({overall_progress})"
                else:
                    formatted_output = decoded
            else:
                formatted_output = decoded

            await handler.queue.put(formatted_output + "\n")
                
        await process.wait()
        
        # Clear cached instances after model download to force reload
        global _model_instances
        async with _model_lock:
            _model_instances.clear()
            logging.info("Cleared model cache after download")
            
    except Exception as e:
        await handler.queue.put(f"Download error: {str(e)}\n")

async def check_model():
    """Check available models"""
    try:
        proc = await asyncio.create_subprocess_exec(
            "ollama", "list",
            stdout=asyncio.subprocess.PIPE,
            stderr=asyncio.subprocess.PIPE
        )
        stdout, stderr = await proc.communicate()
        return stdout.decode().strip()
    except Exception as e:
        logging.error(f"Error checking models: {e}")
        return ""

async def is_valid(question: str, language: str):
    """Improved validity check with multilingual support and cached model"""
    language_name = get_language_name(language)
    valid_prompt = ChatPromptTemplate.from_template(f"""
You are a memory filter AI. Analyze the user's message in {language_name}.
Your task is to determine if the message contains any factual, personal, or goal-related information that should be stored in memory.
Respond strictly in this format:
validity: true/false
type: <category like name, location, goal, preference>
value: <summarized version of the message, clearly expressed as a fact>

User message: {{question}}
""")
    try:
        # Use cached non-streaming model instance
        model = await get_model_instance("gemma3n:e2b", streaming=False)
        chain = valid_prompt | model
        result = await asyncio.to_thread(chain.invoke, {"question": question})
        
        lines = str(result).strip().splitlines()
        validity = "true" in (lines[0] if lines else "").lower()
        mem_type = lines[1].split(":", 1)[-1].strip() if len(lines) > 1 else ""
        value = lines[2].split(":", 1)[-1].strip() if len(lines) > 2 else ""
        
        if mem_type.lower() == 'name':
            return False, "", ""
        return validity, mem_type, value
    except Exception as e:
        logging.error(f"[is_valid error] {e}")
        return False, "", ""

async def today_generate(conversation_context: str, language: str):
    """Improved daily summary generation with multilingual support and cached model"""
    today_str = datetime.now().strftime("%Y-%m-%d")
    language_name = get_language_name(language)
    
    try:
        existing_summary_data = get_today_summary(today_str)
        existing_context = ""
        if existing_summary_data:
            existing_summary = existing_summary_data.get("summary", "")
            existing_tips = existing_summary_data.get("tips", "")
            existing_context = f"### Summary\n{existing_summary}\n\n### Tips\n{existing_tips}"

        prompt_template = ChatPromptTemplate.from_template(f"""
You are a helpful, empathetic mental health assistant. Your task is to read the conversation in {language_name} and generate:

1. A short, emotionally aware summary of the user's mental and emotional state in {language_name}.
2. Three actionable, supportive tips in {language_name}.

You must reply strictly in the following format and say nothing else:

### Summary
<Concise, emotionally intelligent summary here in {language_name}>

### Tips
- <Actionable, supportive tip 1 in {language_name}>
- <Actionable, supportive tip 2 in {language_name}>
- <Actionable, supportive tip 3 in {language_name}>

Only return this format. Do not add explanations, prefaces, or confirmations.

Context (if any): {{existing_context}}  
Conversation: {{conversation_context}}
""")
        
        # Use cached non-streaming model instance
        model = await get_model_instance("gemma3n:e2b", streaming=False)
        chain = prompt_template | model
        result = await asyncio.to_thread(chain.invoke, {
            "existing_context": existing_context, 
            "conversation_context": conversation_context,
        })
        
        parts = str(result).strip().split("### Tips", maxsplit=1)
        summary_part = parts[0].replace("### Summary", "").strip() if len(parts) > 0 else ""
        tips_part = parts[1].strip() if len(parts) > 1 else ""
        
        tips_part = "\n".join([line.strip().lstrip("-*• ") for line in tips_part.splitlines() if line.strip()])

        upsert_today_summary(today_str, summary_part, tips_part)

    except Exception as e:
        logging.error(f"[today_generate error] {e}")

# --- API Endpoints ---

@app.post("/stream")
async def query_stream(request: Request):
    data = await request.json()
    parsed = QueryRequest(**data)
    
    # Auto-detect language if not provided
    if not parsed.language:
        parsed.language = detect_language(parsed.question)
    
    language_name = get_language_name(parsed.language)
    
    handler = CustomHandler()
    
    # Use cached streaming model instance with handler
    model = await get_model_instance(parsed.model, streaming=True, callbacks=[handler])
    chain = prompt | model

    async def run_chain_and_save():
        try:
            special_memories = get_relevant_special_memories(parsed.question)
            
            context = f"User's Name: {parsed.userName}\n{parsed.context}"
            context += "\n".join([mem['memory'] for mem in special_memories])
            
            await asyncio.to_thread(chain.invoke, {
                "context": context,
                "question": parsed.question,
                "language": parsed.language,
                "language_name": language_name
            })

            # Save to buffer
            add_to_buffer(sender='user', message=parsed.question)
            add_to_buffer(sender='assistant', message=handler.buffer)
                
        except Exception as e:
            logging.error(f"Chain invoke error: {str(e)}")

            model_list = await check_model()
            model_names = [line.split()[0].lower() for line in model_list.splitlines()[1:] if line.strip()]
            
            if parsed.model.lower() not in model_names:
                await handler.queue.put("Model not found locally. Downloading the model, please wait...")
                await download_model_background(parsed.model, handler)
            else:
                await handler.queue.put(f"Error: {str(e)}")
        
        finally:
            await handler.queue.put("[END]")

    asyncio.create_task(run_chain_and_save())
    
    # Return SSE stream instead of plain text
    return StreamingResponse(
        handler.token_stream(), 
        media_type="text/event-stream",
        headers={
            "Cache-Control": "no-cache",
            "Connection": "keep-alive",
            "Content-Type": "text/event-stream; charset=utf-8"
        }
    )

@app.post("/process_conversations")
async def process_conversations():
    """Process conversations using the default language setting"""
    try:
        conversations = get_unread_buffer()

        if not conversations:
            return JSONResponse(content={"message": "Buffer is empty."}, status_code=200)

        # Get default language for all processing
        default_lang = get_default_language()
        language_name = get_language_name(default_lang)
        
        user_messages = [conv for conv in conversations if conv.get("sender") == "user"]
        message_ids_to_delete = [conv["id"] for conv in conversations]

        # Process each user message with default language
        tasks = []
        for conv in user_messages:
            question = conv.get("message")
            if not question:
                continue
            
            # Use default language for all analysis
            tasks.extend([
                analyze_and_log_mood(question, default_lang),
                process_message_positivity(question, default_lang)
            ])

        # Run all analysis tasks concurrently
        if tasks:
            await asyncio.gather(*tasks, return_exceptions=True)

        # Generate daily summary with default language
        if conversations:
            conversation_context = "\n".join([f'{conv["sender"]}: {conv["message"]}' for conv in conversations])
            await today_generate(conversation_context, default_lang)

        # Delete processed messages
        if message_ids_to_delete:
            delete_processed_buffer(message_ids_to_delete)

        return JSONResponse(
            content={
                "message": f"Successfully processed {len(user_messages)} user messages in {language_name}."
            }
        )

    except Exception as e:
        logging.error(f"Error processing buffer: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

async def process_message_positivity(question: str, language: str):
    """Helper function to process message positivity with cached model"""
    try:
        result = await is_positive(question, language)
        validity, mem_type, value = await is_valid(question, language)
        
        if result.startswith("special:"):
            title = result.split(":", 1)[1].strip()
            title = title.title()
            add_special_memory(question, title)
    except Exception as e:
        logging.error(f"Error processing message positivity: {e}")

# --- Other Endpoints (Mood, Memory, etc.) ---
    
@app.post("/mood")
async def post_mood_data_json(data: MoodRequest):
    await log_mood(data.graph)
    return {"mood": data.graph}

@app.get("/mood")
async def get_mood_graph_value():
    try:
        with open("mood_log.json", "r", encoding='utf-8') as f:
            return JSONResponse(content=json.load(f))
    except (FileNotFoundError, json.JSONDecodeError):
        return JSONResponse(content=[])

@app.delete("/mood")
async def clear_mood_log():
    try:
        with open("mood_log.json", "w", encoding='utf-8') as f:
            json.dump([], f, ensure_ascii=False)
        return JSONResponse(content={"message": "Mood log cleared successfully"}, status_code=200)
    except Exception as e:
        logging.error(f"Error clearing mood log: {e}")
        return JSONResponse(content={"error": "Failed to clear mood log"}, status_code=500)

@app.get("/special_memory")
async def get_special_memory():
    return JSONResponse(content=load_memories_special())

@app.put("/special_memory")
async def update_special_memory_endpoint(request: SpecialMemoryUpdateRequest):
    try:
        update_special_memory(request.id, request.title, request.memory)
        return JSONResponse(content={"message": "Special memory updated successfully"}, status_code=200)
    except Exception as e:
        logging.error(f"Error updating special memory: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.delete("/memory")
async def delete_memory_endpoint(request: MemoryDeleteRequest):
    try:
        if request.table == "special_memories":
            delete_special_memory(request.id)
        else:
            return JSONResponse(content={"error": "Invalid table specified"}, status_code=400)
        return JSONResponse(content={"message": "Memory deleted successfully"}, status_code=200)
    except Exception as e:
        logging.error(f"Error deleting memory: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/mood_summary")
async def get_mood_summary():
    today_str = datetime.now().strftime("%Y-%m-%d")
    summary_data = get_today_summary(today_str)
    if summary_data:
        return JSONResponse(content=[summary_data])
    return JSONResponse(content=[])

@app.get("/export_data")
async def export_data():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "memory.db")
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()

        all_data = io.StringIO()
        tables = ["special_memories", "conversation_buffer", "daily_summaries"]

        for table_name in tables:
            cursor.execute(f"SELECT * FROM {table_name}")
            rows = cursor.fetchall()
            column_names = [description[0] for description in cursor.description]

            if rows:
                all_data.write(f"Table: {table_name}\n")
                df = pd.DataFrame(rows, columns=column_names)
                df.to_csv(all_data, index=False)
                all_data.write("\n\n")
        
        conn.close()
        all_data.seek(0)

        return StreamingResponse(
            io.BytesIO(all_data.getvalue().encode("utf-8")),
            media_type="text/csv; charset=utf-8",
            headers={
                "Content-Disposition": "attachment; filename=memory_export.csv"
            }
        )

    except Exception as e:
        logging.error(f"Error exporting data: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.delete("/clear_data")
async def clear_data():
    try:
        db_path = os.path.join(os.path.dirname(__file__), "memory.db")
        if os.path.exists(db_path):
            os.remove(db_path)
            return JSONResponse(content={"message": "All data cleared successfully"}, status_code=200)
        else:
            return JSONResponse(content={"message": "Database file not found"}, status_code=404)
    except Exception as e:
        logging.error(f"Error clearing data: {e}")
        return JSONResponse(content={"error": str(e)}, status_code=500)

@app.get("/view_buffer")
async def view_buffer():
    """View current contents of the conversation buffer"""
    try:
        buffer_contents = get_unread_buffer()
        if not buffer_contents:
            return JSONResponse(
                content={"message": "Buffer is empty", "data": []}, 
                status_code=200
            )
        
        formatted_buffer = []
        for entry in buffer_contents:
            formatted_buffer.append({
                "id": entry["id"],
                "sender": entry["sender"],
                "message": entry["message"].split("\n---\n")  # Split into individual messages
            })
            
        return JSONResponse(
            content={
                "message": f"Found {len(buffer_contents)} entries in buffer",
                "data": formatted_buffer
            },
            status_code=200
        )
    except Exception as e:
        logging.error(f"Error viewing buffer: {e}")
        return JSONResponse(
            content={"error": f"Failed to view buffer: {str(e)}"}, 
            status_code=500
        )

# Add this function with other helper functions
def get_default_language():
    """Get the currently set default language"""
    global DEFAULT_LANGUAGE
    return DEFAULT_LANGUAGE

# Update the settings endpoint to store the language
@app.post("/update_settings")
async def update_settings(request: Request):
    """Update user settings"""
    try:
        data = await request.json()
        global DEFAULT_LANGUAGE
        DEFAULT_LANGUAGE = data.get('defaultlang', 'en')
        
        # Save settings to file
        save_settings({'defaultlang': DEFAULT_LANGUAGE})
        
        return JSONResponse(
            content={"message": "Settings updated successfully"},
            status_code=200
        )
    except Exception as e:
        logging.error(f"Error updating settings: {e}")
        return JSONResponse(
            content={"error": f"Failed to update settings: {str(e)}"}, 
            status_code=500
        )

# --- Main Execution Block ---
if __name__ == "__main__":
    import uvicorn
    logging.basicConfig(level=logging.INFO)

    # Try ports from 8000 to 8100 until we find one free
    for port in range(8000, 8101):
        with socket.socket(socket.AF_INET, socket.SOCK_STREAM) as s:
            try:
                s.bind(("127.0.0.1", port))
                break
            except OSError:
                continue
    else:
        raise RuntimeError("No free ports available in range")

    # Save chosen port to JSON file
    config_path = os.path.join(os.path.dirname(__file__), "server_config.json")
    with open(config_path, "w") as f:
        json.dump({"port": port}, f)

    logging.info(f"Starting server on port {port}")
    uvicorn.run("main:app", host="127.0.0.1", port=port, reload=False)