import { useEffect, useState } from "react";
import axios from "axios";

export function useChatLLM(model, question, url, triggerId) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);

  // Llamada para enviar pregunta al modelo
  useEffect(() => {
    if (!model || !question || !url) return;

    const fetchResponse = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await axios.post(
          url,
          { model, question },
          {
            headers: {
              "Content-Type": "application/json",
            },
          }
        );

        setData(response.data);
      } catch (error) {
        const apiMessage =
          error?.response?.data?.detail || "Error inesperado en la API";
        setError(apiMessage);
      } finally {
        setLoading(false);
      }
    };

    fetchResponse();
  }, [model, question, url, triggerId]);

  // Llamada para obtener lista de modelos disponibles
  useEffect(() => {
    const fetchModels = async () => {
      try {
        const response = await axios.get("http://localhost:8000/models");
        setModels(response.data.models || []);
      } catch (err) {
        console.error("Error al obtener modelos:", err);
      }
    };

    fetchModels();
  }, []);

  return { data, loading, error, models };
}
