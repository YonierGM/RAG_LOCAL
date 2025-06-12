import { useState } from "react";
import { Report } from "notiflix/build/notiflix-report-aio";
import { Link } from "react-router-dom";

function DropzoneUploader() {
  const [selectedFiles, setSelectedFiles] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleFileChange = (event) => {
    setSelectedFiles(event.target.files);
    setResult(null); // Limpia resultados anteriores si se selecciona algo nuevo
  };

  const handleUpload = async () => {
    if (!selectedFiles || selectedFiles.length === 0) return;

    const formData = new FormData();
    Array.from(selectedFiles).forEach((file) => {
      formData.append("files", file);
    });

    try {
      setLoading(true);
      const res = await fetch("http://localhost:8000/ingest", {
        method: "POST",
        body: formData,
      });

      let data;
      try {
        data = await res.json();
      } catch (jsonErr) {
        throw new Error("Respuesta del servidor no es válida.");
      }

      if (!res.ok) {
        throw new Error(
          data.detail || "Ocurrió un error al subir los archivos."
        );
      }

      setResult(data);
    } catch (err) {
      setResult({
        files_indexed: [],
        total_chunks: 0,
        errors: [{ file: "Error general", error: err.message }],
      });
    } finally {
      setLoading(false);
    }
  };

  const handleResetEmbeddings = async () => {
    try {
      const res = await fetch("http://localhost:8000/reset_embeddings", {
        method: "DELETE",
      });
      const data = await res.json();
      if (!res.ok) {
        Report.failure(
          "Error al resetear base de datos",
          `${data.detail}`,
          "Okay"
        );
        // throw new Error(data.detail || "Error al resetear la base de datos");
      }
      console.log("Data: ",data)
      Report.success("Vaciar base de datos", `${data.message}`, "Okay");

      setSelectedFiles(null);
      setResult(null);
    } catch (err) {
      Report.failure(
        "Error al resetear base de datos",
        `${data.detail}`,
        "Okay"
      );
    }
  };

  const hasIndexed = result?.files_indexed && result.files_indexed.length > 0;
  const hasErrors = result?.errors && result.errors.length > 0;

  return (
    <div className="flex flex-col items-center justify-center w-full gap-4">
      {/* Dropzone */}
      <label
        htmlFor="dropzone-file"
        className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:hover:border-gray-500 dark:hover:bg-gray-600"
      >
        <div className="flex flex-col items-center justify-center pt-5 pb-6">
          <svg
            className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 20 16"
          >
            <path
              stroke="currentColor"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"
            />
          </svg>
          <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
            <span className="font-semibold">Haz clic para subir</span>
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            PDF, DOCX, TXT.
          </p>
        </div>
        <input
          id="dropzone-file"
          type="file"
          className="hidden"
          multiple
          onChange={handleFileChange}
        />
      </label>

      {/* Archivos seleccionados */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="w-full max-w-md p-4 bg-white dark:bg-gray-800 border rounded-md shadow">
          <h4 className="font-semibold mb-2 text-gray-700 dark:text-gray-200">
            Archivos seleccionados:
          </h4>
          <ul className="list-disc pl-5 text-sm text-gray-600 dark:text-gray-300">
            {Array.from(selectedFiles).map((file, index) => (
              <li key={index}>{file.name}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Botón de enviar */}
      <button
        onClick={handleUpload}
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 max-sm:w-full sm:w-sm"
        disabled={!selectedFiles || loading}
      >
        {loading ? "Subiendo..." : "Subir archivos"}
      </button>

      {/* Resultado */}
      {/* ✅ Éxito */}
      {hasIndexed && (
        <div className="bg-green-100 text-green-800 p-4 rounded-lg max-w-2xl w-full shadow">
          <h3 className="font-semibold text-lg mb-2">
            ✅ ¡Archivos indexados con éxito!
          </h3>
          <ul className="list-disc list-inside mb-2">
            {result.files_indexed.map((file, index) => (
              <li key={index}>{file}</li>
            ))}
          </ul>
          <p className="text-sm">
            🧠 Se generaron <strong>{result.total_chunks}</strong> fragmentos de
            texto para búsqueda contextual.
          </p>
        </div>
      )}

      {/* ⚠️ Errores */}
      {hasErrors && (
        <div className="bg-yellow-100 text-yellow-800 p-4 rounded-lg max-w-2xl w-full shadow">
          <h3 className="font-semibold text-lg mb-2">
            ⚠️ Algunos archivos no se pudieron procesar:
          </h3>
          <ul className="list-disc list-inside">
            {result.errors.map((err, idx) => (
              <li key={idx}>
                <strong>{err.file}:</strong> {err.error}
              </li>
            ))}
          </ul>
        </div>
      )}

      <button
        onClick={handleResetEmbeddings}
        className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 max-sm:w-full sm:w-sm"
      >
        Limpiar la base de datos
      </button>

      <Link className="" to="/">
        <button
          type="button"
          class="cursor-pointer py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 focus:z-10 focus:ring-4 focus:ring-gray-100 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 max-sm:w-full sm:w-sm"
        >
          Volver
        </button>
      </Link>
    </div>
  );
}

export default DropzoneUploader;
