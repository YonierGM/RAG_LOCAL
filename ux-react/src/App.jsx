import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import Home from "./components/Home";
import Ingest from "./components/Ingest";

function App() {
  return (
    <BrowserRouter>
      <div className="MainLayout">
        <Routes>
          <Route path="/" element={<Home />}></Route>
          <Route path="/settings" element={<Ingest />}></Route>
        </Routes>
      </div>
    </BrowserRouter>
  );
}

export default App;
