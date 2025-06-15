import { useState, useEffect } from "react";
import axios from "axios";

export function useChatHistory(historyUrl) {
  const [chatHistory, setChatHistory] = useState([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [historyError, setHistoryError] = useState(null);

  useEffect(() => {
    const fetchInitialHistory = async () => {
      setIsLoadingHistory(true);
      setHistoryError(null);
      try {
        const response = await axios.get(historyUrl);
        setChatHistory(response.data);
      } catch (e) {
        console.error("Error al obtener el historial inicial:", e);
        setHistoryError("Error al cargar el historial. Intente recargar la página.");
      } finally {
        setIsLoadingHistory(false);
      }
    };

    fetchInitialHistory();
  }, [historyUrl]);

  return { chatHistory, setChatHistory, isLoadingHistory, historyError };
}