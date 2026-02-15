import { useState, useCallback } from "react";
import type { PublishData } from "@/types/rfq";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { CheckCircle2, Download, Link2, Copy, X } from "lucide-react";

interface PublishDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  data: PublishData;
}

export default function PublishDialog({ open, onOpenChange, data }: PublishDialogProps) {
  const [copied, setCopied] = useState(false);
  const [downloaded, setDownloaded] = useState(false);

  const shareUrl = `${window.location.origin}/form/${data.share_id}`;

  const handleDownload = useCallback(() => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `rfq-${data.share_id}.json`;
    a.click();
    URL.revokeObjectURL(url);
    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 3000);
  }, [data]);

  const handleCopyLink = useCallback(async () => {
    await navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 3000);
  }, [shareUrl]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => onOpenChange(false)} />
      <div className="relative z-10 w-full max-w-md mx-4 rounded-2xl border bg-background shadow-2xl">
        <div className="p-6">
          <button onClick={() => onOpenChange(false)} className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 rounded-md hover:bg-muted">
            <X className="w-4 h-4" />
          </button>

          <div className="flex items-start gap-4 mb-6">
            <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
              <CheckCircle2 className="w-5 h-5 text-primary" />
            </div>
            <div>
              <h2 className="text-base font-semibold">Form Published</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{new Date(data.published_at).toLocaleString()}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 p-3 rounded-xl bg-muted/50 mb-5 text-xs">
            <div className="text-muted-foreground">Share ID</div>
            <div className="text-right"><Badge variant="secondary" className="font-mono text-[10px]">{data.share_id}</Badge></div>
            <div className="text-muted-foreground">Sections</div>
            <div className="text-right font-medium">{data.sections.length}</div>
            <div className="text-muted-foreground">Fields</div>
            <div className="text-right font-medium">{data.fields.length}</div>
            <div className="text-muted-foreground">Line Items</div>
            <div className="text-right font-medium">{data.line_items.length}</div>
          </div>

          <Separator className="mb-5" />

          <div className="space-y-4">
            <div>
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                <Link2 className="w-3 h-3" /> Shareable Link
              </p>
              <div className="flex gap-2">
                <Input value={shareUrl} readOnly className="text-xs h-9 font-mono bg-muted border-0" />
                <Button size="sm" variant={copied ? "default" : "outline"} onClick={handleCopyLink} className="shrink-0 h-9 px-3">
                  {copied ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                </Button>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1.5">
                Link works in the same browser. Form data is saved to localStorage.
              </p>
            </div>

            <div>
              <p className="text-xs font-medium mb-2 flex items-center gap-1.5 text-muted-foreground uppercase tracking-wider">
                <Download className="w-3 h-3" /> Save as JSON
              </p>
              <Button className="w-full h-9" variant={downloaded ? "secondary" : "default"} onClick={handleDownload}>
                {downloaded
                  ? <><CheckCircle2 className="w-4 h-4 mr-2" />Downloaded!</>
                  : <><Download className="w-4 h-4 mr-2" />Download rfq-{data.share_id}.json</>
                }
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}