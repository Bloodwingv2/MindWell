
# Importing necessary libraries for LLM, Ollama and Speech Synthesis
from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
#from Binaries.xtts import synthesis

# Importing necessary libraries for LLM and FastAPI
from fastapi import FastAPI, Request # FastApi Libraries for Inference
from pydantic import BaseModel # Importing necessary libraries for FastApi
from fastapi.responses import StreamingResponse # importing StreamingResponse from FastAPi
import asyncio
from fastapi.middleware.cors import CORSMiddleware
import logging

# Import subprocess for model download
import subprocess

class QueryRequest(BaseModel): # Request structure for FastAPI
    question: str
    context: str = ""
    model: str = "gemma3n:e2b-it-q4_K_M"  # Default model with fallback


class customhandler(StreamingStdOutCallbackHandler):
    def __init__(self):
        self.buffer = ""
        super().__init__()
        self.queue = asyncio.Queue() # Initializing an asyncio queue to handle tokens

    async def on_llm_new_token(self, token: str, **kwargs)-> None:
        print(token, end= "", flush=True)
        self.buffer += token
        await self.queue.put(token) # Adding Token to the queue for FastApi Processing
        if self.buffer.endswith(('.', '!', '?')) and len(self.buffer.strip().split()) >= 4: # Added Minor space to fix sentence processing error
            #synthesis(self.buffer)
            self.buffer = ""

    async def token_stream(self):
        while True:
            token = await self.queue.get()
            if token == "[END]":
                break
            yield token.encode('utf-8')

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
You are a AI assistant named GemmaTalk, Made by a Male human named as Mirang Bhandari, Answer the question below concisely

Here is the conversation history: {context}

Question: {question}

Answer:
"""

# Create prompt template once (reusable)
prompt = ChatPromptTemplate.from_template(template)

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

    async def run_chain():
        try:
            await asyncio.to_thread(chain.invoke, {
                "context": parsed.context,
                "question": parsed.question
            })
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

    asyncio.create_task(run_chain())

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
    #print("\n")
