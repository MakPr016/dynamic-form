import type { RFQData } from "@/types/rfq";
import mockData from "@/mock/response.json";

const USE_MOCK = true;

export async function parseRFQ(_file: File): Promise<RFQData> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 800));
    return mockData as RFQData;
  }

  const BASE_URL = "http://localhost:8000";
  const formData = new FormData();
  formData.append("file", _file);

  const response = await fetch(`${BASE_URL}/parse-rfq`, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || `Server error: ${response.status}`);
  }

  return response.json() as Promise<RFQData>;
}