# 🔍 RAG Local API - FastAPI + LangChain + Ollama + Chroma

Este proyecto implementa una API local de Recuperación Aumentada por Generación (RAG) usando:

- 🧠 **FastAPI** para el backend
- 🔗 **LangChain** para orquestar la lógica RAG
- 🦙 **Ollama** para correr modelos LLM y de embeddings localmente
- 🧠 **ChromaDB** como base vectorial para recuperación semántica
- 🐳 **Docker Compose** para contenerizar todo

## 🐳 Requisitos previos

- [Docker](https://www.docker.com/)
---


## 🚀 ¿Qué hace este proyecto?

1. ✅ Permite subir documentos para extraer su contenido y almacenarlo como embeddings usando `mxbai-embed-large`.
2. 🔍 Usa `LangChain` con `Chroma` como base vectorial persistente para consultas semánticas.
3. 🤖 Usa modelos LLM locales como `llama3` mediante **Ollama** para responder preguntas.
4. 🧩 Implementa `chat history`, re-ingesta, y control de errores con archivos corruptos o no extraíbles.
5. 🧾 La interfaz en React permite interactuar con la IA como un chat.


## ⚙️ Tecnologías principales

- LLM: `llama3.2:latest` o el de tu preferencia
- Embeddings: `mxbai-embed-large`
- Backend API: FastAPI
- Vector store: Chroma
- Gestión de prompts y memoria contextual: LangChain

---


### 📂 Funcionalidades del Backend (FastAPI)
- `POST /ingest`: Ingresa documentos (PDF, DOCX, TXT). Maneja errores comunes.
- `POST /ask_model`: Consulta al modelo con una pregunta y contexto extraído de los documentos.
- `DELETE /reset_embeddings`: Limpia toda la base de datos vectorial para nuevas ingestiones.
- 
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

### 3. Instalar modelos en el contenedor de ollama
- Modelo de embeddings `mxbai-embed-large`
- modelo LLM `llama3.2`

Accede al contenedor de ollama `Containers/rag_local-ollama-1` y ejecutar los comandos:

<p align="center">
<img style="width:100%; height:100%;" src="https://github.com/YonierGM/imagenes-proyecto/blob/master/Contenedor.png?raw=true/>
</p>

```bash
ollama pull mxbai-embed-large
ollama run llama3.2
```
