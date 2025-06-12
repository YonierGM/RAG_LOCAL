from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from config import settings
from config.prompt_template import build_prompt
from config.settings import create_chat_model
from config.history import get_last_pairs, add_pair, conversation_history
from langchain.schema import HumanMessage
from config.utils import is_valid_model

router = APIRouter()

class AskModelRequest(BaseModel):
    question: str
    model: str

@router.post("/ask_model")
async def ask_model(req: AskModelRequest):
    if not req.model or not req.question:
        raise HTTPException(status_code=400, detail="Complete todos los campos")

    if not is_valid_model(req.model):
        raise HTTPException(status_code=400, detail=f"El modelo '{req.model}' no está disponible en Ollama.")

    # Usamos get_vectordb() para asegurarnos de tener la última instancia
    vectordb = settings.get_vectordb()
    # Verificamos que la colección contenga documentos.
    if vectordb._collection.count() == 0:
        raise HTTPException(status_code=400, detail="No hay documentos indexados. Ingeste archivos primero.")

    last_pairs = get_last_pairs(k=2)
    history_text = "\n".join(
        f"👤 Usuario: {item['question']}\n🤖 IA: {item['answer']}"
        for item in last_pairs
    )

    # Creamos un retriever a partir de la instancia actual
    retriever = vectordb.as_retriever(
        search_type="mmr",
        search_kwargs={"k": 8, "lambda_mult": 0.8}
    )
    docs = retriever.invoke(req.question)
    context = "".join(doc.page_content for doc in docs)

    prompt = build_prompt(req.question, context, history_text)
    model = create_chat_model(req.model)
    resp = model.invoke([HumanMessage(content=prompt)])
    add_pair(req.question, resp.content)

    return {
        "question": req.question,
        "model": req.model,
        "answer": resp.content,
        "history": conversation_history
    }
