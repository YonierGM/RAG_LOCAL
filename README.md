# 🔍 RAG Local API - FastAPI + LangChain + Ollama + Chroma

Este proyecto implementa una API local de Recuperación Aumentada por Generación (RAG) usando:

- 🧠 **FastAPI** para el backend
- 🔗 **LangChain** para orquestar la lógica RAG
- 🦙 **Ollama** para correr modelos LLM y de embeddings localmente
- 🧠 **ChromaDB** como base vectorial para recuperación semántica
- 🐳 **Docker Compose** para contenerizar todo

## ⚙️ Tecnologías principales

- LLM: `llama3.2:latest` o el de tu preferencia
- Embeddings: `mxbai-embed-large`
- Backend API: FastAPI
- Vector store: Chroma
- Gestión de prompts y memoria contextual: LangChain

---

## 🚀 Paso a paso para levantar el proyecto

### 1. Clona el repositorio

```bash
git clone https://github.com/YonierGM/RAG_LOCAL
cd RAG_LOCAL
```

### 2. Construir contenedores y levantar proyecto
```bash
docker compose up --build
```
