import { useEffect, useState } from "react";
import axios from "axios";

export function useChatLLM(model, question, url, triggerId) {
  const [data, setData] = useState();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [models, setModels] = useState([]);

  useEffect(() => {
    if (!model || !question || !url) return;
    setLoading(true);
    axios
      .post(
        url,
        { model, question },
        { headers: { "Content-Type": "application/json" } }
      )
      .then((response) => {
        setData(response.data);
        setLoading(false);
      })
      .catch((error) => {
        const apiMessage =
          error?.response?.data?.detail || "Error inesperado en la API";

        setError(apiMessage);
        setLoading(false);
      });
  }, [model, question, url, triggerId]);

  useEffect(() => {
    fetch("http://localhost:8000/models")
      .then((res) => res.json())
      .then((data) => {
        setModels(data.models); // usa un useState
      });
  }, []);

  return { data, loading, error, models };
}
