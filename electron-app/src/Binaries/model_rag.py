from langchain_ollama import OllamaLLM
from langchain_core.prompts import ChatPromptTemplate
from langchain.callbacks.streaming_stdout import StreamingStdOutCallbackHandler
import asyncio




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

handler = customhandler()
template = """
You are a Humourous AI assistant named ISAC, Made by a Male human named as Mirang Bhandari, Answer the question below concisely

Here is the conversation history: {context}

Question: {question}

Answer:
"""
model = OllamaLLM(model = "mistral", streaming = True, callbacks=[handler])
prompt = ChatPromptTemplate.from_template(template)
chain = prompt | model