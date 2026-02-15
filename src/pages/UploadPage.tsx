import { useState, useCallback, type DragEvent, type ChangeEvent } from "react";
import { parseRFQ } from "@/api/rfqApi";
import type { RFQData } from "@/types/rfq";
import { FileText, Upload, Loader2, AlertCircle, Sparkles } from "lucide-react";

interface UploadPageProps {
  onParsed: (data: RFQData) => void;
}

export default function UploadPage({ onParsed }: UploadPageProps) {
  const [dragging, setDragging] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  const handleFile = useCallback(async (file: File) => {
    if (!file.name.endsWith(".pdf")) { setError("Only PDF files are supported."); return; }
    setFileName(file.name);
    setError(null);
    setLoading(true);
    try {
      const data = await parseRFQ(file);
      onParsed(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to parse RFQ.");
    } finally {
      setLoading(false);
    }
  }, [onParsed]);

  function onDrop(e: DragEvent<HTMLLabelElement>) {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  return (
    <div className="min-h-screen bg-background flex">
      <div className="w-64 border-r bg-sidebar flex flex-col p-4 shrink-0">
        <div className="flex items-center gap-2 px-2 py-3 mb-6">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">RFQ Parser</span>
        </div>
        <nav className="space-y-0.5 text-sm">
          {["Dashboard", "Forms", "Templates", "Settings"].map((item) => (
            <div key={item} className={`flex items-center gap-2.5 px-3 py-2 rounded-lg cursor-default text-muted-foreground hover:text-foreground hover:bg-accent transition-colors ${item === "Forms" ? "bg-accent text-foreground font-medium" : ""}`}>
              <div className="w-4 h-4 rounded-sm bg-current opacity-30" />
              {item}
            </div>
          ))}
        </nav>
      </div>

      <div className="flex-1 flex flex-col">
        <header className="border-b px-8 py-4 flex items-center justify-between bg-background">
          <div>
            <h1 className="text-xl font-semibold">New Form</h1>
            <p className="text-sm text-muted-foreground">Upload an RFQ PDF to generate a dynamic form</p>
          </div>
        </header>

        <div className="flex-1 flex items-center justify-center p-8">
          <div className="w-full max-w-lg space-y-6">
            <label
              onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
              onDragLeave={() => setDragging(false)}
              onDrop={onDrop}
              className={`
                flex flex-col items-center justify-center w-full h-64 rounded-xl
                border-2 border-dashed cursor-pointer transition-all duration-200
                ${dragging ? "border-primary bg-primary/5" : "border-border hover:border-primary/50 hover:bg-muted/30"}
                ${loading ? "pointer-events-none opacity-60" : ""}
              `}
            >
              <input type="file" accept=".pdf" className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => { const f = e.target.files?.[0]; if (f) handleFile(f); }} disabled={loading} />
              {loading ? (
                <div className="flex flex-col items-center gap-3 text-center">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <div>
                    <p className="text-sm font-medium">Parsing with Qwen 2.5 3B…</p>
                    <p className="text-xs text-muted-foreground mt-0.5">{fileName}</p>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-3 text-center px-8">
                  <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                    {dragging ? <Upload className="w-6 h-6 text-primary" /> : <FileText className="w-6 h-6 text-primary" />}
                  </div>
                  <div>
                    <p className="text-sm font-medium">{dragging ? "Drop to upload" : "Drop your RFQ PDF here"}</p>
                    <p className="text-xs text-muted-foreground mt-1">or click to browse files</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mt-1">
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-green-500" />100% Local</span>
                    <span className="flex items-center gap-1"><span className="w-1.5 h-1.5 rounded-full bg-primary" />Qwen2.5 3B</span>
                  </div>
                </div>
              )}
            </label>
            {error && (
              <div className="flex items-center gap-2 px-4 py-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}