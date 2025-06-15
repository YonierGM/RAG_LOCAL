// src/Home.jsx
import React from "react";
import { useForm } from "react-hook-form";
import { useState, useRef, useEffect } from "react";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { Link } from "react-router-dom";

import { useChatLLM } from "../hooks/useChatLLM";
import { useChatHistory } from "../hooks/useChatHistory";
import { formatDate } from "../utils/formatUtils";

function Home() {
  const askModelUrl = "http://localhost:8000/ask_model";
  const historyUrl = "http://localhost:8000/history";

  const chatContainerRef = useRef(null);

  const { chatHistory, setChatHistory, isLoadingHistory, historyError } = useChatHistory(historyUrl);

  const {
    register,
    handleSubmit,
    formState: { errors },
    resetField,
    setValue,
  } = useForm();

  const [params, setParams] = useState(null);
  const { data, loading, error, models } = useChatLLM(
    params?.model,
    params?.question,
    params?.url,
    params?.triggerId
  );

  useEffect(() => {
    if (data && data.history) {
      setChatHistory(data.history);
    }
  }, [data, setChatHistory]);

  useEffect(() => {
    if (models.length > 0) {
      setValue("model", models[0]);
    }
  }, [models, setValue]);

  const onSubmit = ({ model, question }) => {
    setParams({ model, question, url: askModelUrl, triggerId: Date.now() });
    resetField("question");
  };

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chatHistory, isLoadingHistory]);

  return (
    <div className="home flex flex-col h-screen min-md:w-[80%] mx-auto">
      {/* Contenedor de mensajes de chat */}
      <div
        ref={chatContainerRef}
        className="flex-1 overflow-y-auto px-4 py-6 space-y-4"
      >
        {/* Muestra errores combinados */}
        {(error || historyError) && (
          <span className="text-red-500">{error || historyError}</span>
        )}

        {/* Indicador de carga del historial inicial */}
        {isLoadingHistory && <p>Cargando historial...</p>}

        {/* Renderiza el historial de chat */}
        {!isLoadingHistory && chatHistory.map((item, index) => (
          <div key={index} className="space-y-2">
            {/* Pregunta del usuario */}
            <div className="flex justify-end">
              <div className="bg-gray-100 text-gray-900 rounded-xl p-3 w-auto min-md:max-w-[90%]">
                <p>{item.question}</p>
              </div>
            </div>

            {/* Respuesta de la IA con Markdown */}
            <div className="flex justify-start">
              <div className="text-gray-900 rounded-xl p-3 min-md:w-[90%]">
                <div className="prose prose-sm dark:prose-invert max-w-none">
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {item.answer}
                  </ReactMarkdown>
                </div>
              </div>
            </div>
            <span className="px-3 text-xs text-gray-500 flex justify-start">
              {formatDate(item.timestamp)}
            </span>
          </div>
        ))}
      </div>

      {/* Formulario de entrada (resto del código igual) */}
      <form
        onSubmit={handleSubmit(onSubmit)}
        className="flex gap-1 pt-4 border-t bg-white dark:bg-gray-800"
      >
        {/* Selector del modelo */}
        <div className="model">
          <select
            id="model"
            className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full h-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            {...register("model", { required: true })}
          >
            {models.map((model) => (
              <option key={model} value={model}>
                {model}
              </option>
            ))}
          </select>
        </div>

        {errors.model && (
          <p className="text-red-500 text-sm">selecciona un modelo</p>
        )}

        {/* Campo de entrada de la pregunta */}
        <div className="flex items-center w-full">
          <div className="relative w-full">
            <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
              <svg
                className="w-4 h-4 me-2"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 20 20"
              >
                <path
                  stroke="currentColor"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"
                />
              </svg>
            </div>
            <input
              id="question"
              {...register("question", { required: true })}
              type="text"
              className="bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full ps-10 p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="Consulta"
              disabled={loading}
            />
          </div>

          {/* Botón de enviar */}
          <button
            disabled={loading}
            type="submit"
            className="inline-flex items-center py-2.5 px-3 ms-2 text-sm font-medium text-white bg-blue-700 rounded-lg border border-blue-700 hover:bg-blue-800 focus:ring-4 dark:bg-blue-600"
          >
            {loading ? (
              <svg
                aria-hidden="true"
                role="status"
                className="inline w-4 h-4 me-3 text-white animate-spin"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                  fill="#E5E7EB"
                />
                <path
                  d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                  fill="currentColor"
                />
              </svg>
            ) : null}
            {loading ? "Consultando..." : "Consultar"}
          </button>
        </div>
      </form>
      <Link
        className="flex justify-center gap-1.5 hover:opacity-90 p-2 shadow-md hover:shadow-lg"
        to="/settings"
      >
        <svg
          className="w-6 h-6 text-gray-800 dark:text-white"
          aria-hidden="true"
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          fill="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            fillRule="evenodd"
            d="M17 10v1.126c.367.095.714.24 1.032.428l.796-.797 1.415 1.415-.797.796c.188.318.333.665.428 1.032H21v2h-1.126c-.095.367-.24.714-.428 1.032l.797.796-1.415 1.415-.796-.797a3.979 3.979 0 0 1-1.032.428V20h-2v-1.126a3.977 3.977 0 0 1-1.032-.428l-.796.797-1.415-1.415.797-.796A3.975 3.975 0 0 1 12.126 16H11v-2h1.126c.095-.367.24-.714.428-1.032l-.797-.796 1.415-1.415.796.797A3.977 3.977 0 0 1 15 11.126V10h2Zm.406 3.578.016.016c.354.358.574.85.578 1.392v.028a2 2 0 0 1-3.409 1.406l-.01-.012a2 2 0 0 1 2.826-2.83ZM5 8a4 4 0 1 1 7.938.703 7.029 7.029 0 0 0-3.235 3.235A4 4 0 0 1 5 8Zm4.29 5H7a4 4 0 0 0-4 4v1a2 2 0 0 0 2 2h6.101A6.979 6.979 0 0 1 9 15c0-.695.101-1.366.29-2Z"
            clipRule="evenodd"
          />
        </svg>
        Ajustes
      </Link>
    </div>
  );
}

export default Home;