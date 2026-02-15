import { useState } from "react";
import type { LineItem } from "@/types/rfq";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Upload, FileSpreadsheet } from "lucide-react";

interface LineItemsTableProps {
  items: LineItem[];
  onChange: (items: LineItem[]) => void;
}

export default function LineItemsTable({ items, onChange }: LineItemsTableProps) {
  const [search, setSearch] = useState("");
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);

  const filtered = items.filter(item =>
    item.description.toLowerCase().includes(search.toLowerCase())
  );

  function updateItem(sr: number, field: keyof LineItem, value: string | number) {
    onChange(items.map(item => {
      if (item.sr !== sr) return item;
      const updated = { ...item, [field]: value };
      if (field === "unit_price" || field === "qty") {
        const price = field === "unit_price" ? Number(value) : Number(item.unit_price ?? 0);
        const qty = field === "qty" ? Number(value) : item.qty;
        updated.total_price = price && qty ? parseFloat((price * qty).toFixed(2)) : null;
      }
      return updated;
    }));
  }

  const grandTotal = items.reduce((sum, i) => sum + (i.total_price ?? 0), 0);
  const filledCount = items.filter(i => i.unit_price !== null && i.unit_price > 0).length;

  return (
    <div className="space-y-5">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold">Schedule of Requirements</h2>
          <p className="text-xs text-muted-foreground mt-0.5">
            Enter unit prices for each line item. Total is auto-calculated.
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="text-xs">
            {filledCount}/{items.length} priced
          </Badge>
          {grandTotal > 0 && (
            <Badge className="text-xs font-mono">
              Total: ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
            </Badge>
          )}
        </div>
      </div>

      <div className="rounded-xl border bg-muted/30 p-4 flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
            <FileSpreadsheet className="w-4 h-4 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium">Upload Excel Offer Sheet</p>
            <p className="text-xs text-muted-foreground">PR_4200705309.xlsx — must be signed and stamped</p>
          </div>
        </div>
        <label className="sm:ml-auto cursor-pointer">
          <input
            type="file"
            accept=".xlsx,.xls,.csv"
            className="hidden"
            onChange={e => setUploadedFile(e.target.files?.[0] ?? null)}
          />
          <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-xs text-muted-foreground hover:border-primary hover:text-foreground transition-colors">
            <Upload className="w-3.5 h-3.5" />
            {uploadedFile ? uploadedFile.name : "Choose file"}
          </div>
        </label>
      </div>

      <Separator />

      <div className="flex items-center gap-3">
        <Input
          placeholder="Search items..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="max-w-xs h-8 text-sm"
        />
        {search && (
          <span className="text-xs text-muted-foreground">{filtered.length} results</span>
        )}
      </div>

      <div className="rounded-xl border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-10">#</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground min-w-[260px]">Description</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-32">Unit</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-20">Qty</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-32">Unit Price (USD)</th>
                <th className="text-right px-3 py-2.5 text-xs font-medium text-muted-foreground w-32">Total (USD)</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-36">Brand</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-36">Expiry Date</th>
                <th className="text-left px-3 py-2.5 text-xs font-medium text-muted-foreground w-40">Remarks</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((item, idx) => (
                <tr
                  key={item.sr}
                  className={`border-b last:border-0 transition-colors ${
                    idx % 2 === 0 ? "bg-background" : "bg-muted/20"
                  } hover:bg-accent/30`}
                >
                  <td className="px-3 py-2 text-xs text-muted-foreground font-mono">{item.sr}</td>
                  <td className="px-3 py-2 text-xs leading-relaxed">{item.description}</td>
                  <td className="px-3 py-2 text-xs text-muted-foreground">{item.unit}</td>
                  <td className="px-3 py-2 text-right text-xs font-mono">{item.qty}</td>
                  <td className="px-3 py-2">
                    <Input
                      type="number"
                      min={0}
                      step="0.01"
                      placeholder="0.00"
                      value={item.unit_price ?? ""}
                      onChange={e => updateItem(item.sr, "unit_price", parseFloat(e.target.value) || 0)}
                      className="h-7 text-xs text-right font-mono w-full"
                    />
                  </td>
                  <td className="px-3 py-2 text-right text-xs font-mono text-muted-foreground">
                    {item.total_price !== null && item.total_price > 0
                      ? item.total_price.toLocaleString("en-US", { minimumFractionDigits: 2 })
                      : "—"}
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="Brand name"
                      value={item.brand}
                      onChange={e => updateItem(item.sr, "brand", e.target.value)}
                      className="h-7 text-xs w-full"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      type="date"
                      value={item.expiry_date}
                      onChange={e => updateItem(item.sr, "expiry_date", e.target.value)}
                      className="h-7 text-xs w-full [color-scheme:light] dark:[color-scheme:dark]"
                    />
                  </td>
                  <td className="px-3 py-2">
                    <Input
                      placeholder="Optional"
                      value={item.remarks}
                      onChange={e => updateItem(item.sr, "remarks", e.target.value)}
                      className="h-7 text-xs w-full"
                    />
                  </td>
                </tr>
              ))}
            </tbody>
            {grandTotal > 0 && !search && (
              <tfoot>
                <tr className="border-t bg-muted/40">
                  <td colSpan={5} className="px-3 py-2.5 text-xs font-medium text-right text-muted-foreground">
                    Grand Total
                  </td>
                  <td className="px-3 py-2.5 text-right text-xs font-mono font-semibold">
                    ${grandTotal.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                  </td>
                  <td colSpan={3} />
                </tr>
              </tfoot>
            )}
          </table>
        </div>
      </div>
    </div>
  );
}