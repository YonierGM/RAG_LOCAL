import { Link } from "react-router-dom";
import { useUploader } from "../hooks/useUploader";
import { useState } from "react";

function DropzoneUploader() {
  const {
    selectedFiles,
    result,
    loading,
    handleFileChange,
    handleUpload,
    handleResetEmbeddings,
    hasIndexed,
    hasErrors,
  } = useUploader();

  const [chunkSize, setChunkSize] = useState(1000); // Valor por defecto
  const [chunkOverlap, setChunkOverlap] = useState(50); // Valor por defecto

  //subida con los parámetros de chunking
  const onUploadClick = () => {
    handleUpload(chunkSize, chunkOverlap);
  };

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

      {/* Campos para Chunk Size y Chunk Overlap */}
      <div className="w-full max-w-md flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <label htmlFor="chunkSizeInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chunk Size (caracteres):
          </label>
          <input
            id="chunkSizeInput"
            type="number"
            value={chunkSize}
            onChange={(e) => setChunkSize(parseInt(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="1" // No permitir 0 o negativos
          />
        </div>
        <div className="flex-1">
          <label htmlFor="chunkOverlapInput" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Chunk Overlap (caracteres):
          </label>
          <input
            id="chunkOverlapInput"
            type="number"
            value={chunkOverlap}
            onChange={(e) => setChunkOverlap(parseInt(e.target.value) || 0)}
            className="w-full p-2 border border-gray-300 rounded-md bg-gray-50 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            min="0" // Permitir 0, pero no negativos
          />
        </div>
      </div>

      {/* Archivos seleccionados */}
      {selectedFiles && selectedFiles.length > 0 && (
        <div className="w-full max-w-md p-4 bg-white dark:bg-gray-800 border rounded-md shadow rounded-lg">
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
        onClick={onUploadClick}
        className="cursor-pointer px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 max-sm:w-full sm:w-sm rounded-lg shadow"
        disabled={!selectedFiles || loading}
      >
        {loading ? "Subiendo..." : "Subir archivos"}
      </button>

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
            🧠 Se generaron <strong>{result.total_chunks}</strong> fragmentos de texto.
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
        className="cursor-pointer px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 max-sm:w-full sm:w-sm rounded-lg shadow"
      >
        Limpiar la base de datos
      </button>

      <Link to="/">
        <button
          type="button"
          className="cursor-pointer py-2.5 px-5 me-2 mb-2 text-sm font-medium text-gray-900 focus:outline-none bg-white rounded-lg border border-gray-200 hover:bg-gray-100 hover:text-blue-700 dark:focus:ring-gray-700 dark:bg-gray-800 dark:text-gray-400 dark:border-gray-600 dark:hover:text-white dark:hover:bg-gray-700 max-sm:w-full sm:w-sm shadow"
        >
          Volver
        </button>
      </Link>
    </div>
  );
}

export default DropzoneUploader;