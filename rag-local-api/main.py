from fastapi import FastAPI
from routes.ingest import router as ingest_router
from routes.ask import router as ask_router
from routes.model import router as model_router
from routes.history import router as history_router
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="RAG LOCAL",
    description="API local para RAG con FastAPI, LangChain y Ollama",
    version="1.0.0",
    contact={
        "name": "Yonier Garcia Mosquera",
        "linkedin": "www.linkedin.com/in/yoniergm",
        "email": "yoniermosquera55@gmail.com",
    }
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173", "http://localhost:3000"],
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
def root():
    return {"message": "Hola mundo"}

app.include_router(ingest_router)
app.include_router(ask_router)
app.include_router(model_router)
app.include_router(history_router)