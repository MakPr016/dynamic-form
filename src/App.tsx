import { useState } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import type { RFQData } from "@/types/rfq";
import UploadPage from "@/pages/UploadPage";
import FormPage from "@/pages/FormPage";
import SharedFormPage from "@/pages/SharedFormPage";

function AppRoutes() {
  const [rfqData, setRfqData] = useState<RFQData | null>(null);
  const navigate = useNavigate();

  function handleParsed(data: RFQData) {
    setRfqData(data);
    navigate("/form");
  }

  function handleReset() {
    setRfqData(null);
    navigate("/");
  }

  return (
    <Routes>
      <Route path="/" element={<UploadPage onParsed={handleParsed} />} />
      <Route
        path="/form"
        element={rfqData ? <FormPage data={rfqData} onReset={handleReset} /> : <Navigate to="/" replace />}
      />
      <Route path="/form/:shareId" element={<SharedFormPage />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}