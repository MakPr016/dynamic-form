import { useMemo, useState, useCallback } from "react";
import { useForm, FormProvider } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import type { RFQData, LineItem, PublishData } from "@/types/rfq";
import { buildZodSchema } from "@/lib/buildSchema";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DynamicField from "@/components/DynamicField";
import LineItemsTable from "@/components/Lineitemstable";
import PublishDialog from "@/components/Publishdialog";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";

interface FormPageProps {
  data: RFQData;
  onReset: () => void;
}

const LINE_ITEMS_TAB = "__line_items__";
const STORAGE_KEY = "rfq_published_forms";

export default function FormPage({ data, onReset }: FormPageProps) {
  const schema = useMemo(() => buildZodSchema(data.fields), [data.fields]);
  const defaultValues = useMemo(() =>
    data.fields.reduce<Record<string, unknown>>((acc, field) => {
      if (field.type === "checkbox" && field.options.length > 0) acc[field.id] = [];
      else if (field.type === "checkbox") acc[field.id] = false;
      else if (field.type === "file") acc[field.id] = null;
      else acc[field.id] = "";
      return acc;
    }, {}),
    [data.fields]
  );

  const form = useForm<Record<string, unknown>>({ resolver: zodResolver(schema), defaultValues, mode: "onBlur" });

  const hasLineItems = (data.line_items?.length ?? 0) > 0;
  const sections = useMemo(() => {
    const base = data.sections.length > 0 ? data.sections : ["General"];
    return hasLineItems ? [...base, LINE_ITEMS_TAB] : base;
  }, [data.sections, hasLineItems]);

  const [activeTab, setActiveTab] = useState(sections[0]);
  const [lineItems, setLineItems] = useState<LineItem[]>((data.line_items ?? []).map(i => ({ ...i })));
  const [publishOpen, setPublishOpen] = useState(false);
  const [publishData, setPublishData] = useState<PublishData | null>(null);

  const activeIndex = sections.indexOf(activeTab);
  const fieldsBySection = useMemo(() =>
    data.sections.reduce<Record<string, typeof data.fields>>((acc, s) => {
      acc[s] = data.fields.filter(f => (f.section || "General") === s);
      return acc;
    }, {}),
    [data.fields, data.sections]
  );

  const filledCount = Object.values(form.watch()).filter(v => {
    if (Array.isArray(v)) return v.length > 0;
    if (typeof v === "boolean") return v;
    return v !== "" && v !== null && v !== undefined;
  }).length;

  const handlePublish = useCallback(() => {
    const shareId = Math.random().toString(36).slice(2, 10).toUpperCase();
    const payload: PublishData = {
      rfq_title: data.title,
      published_at: new Date().toISOString(),
      share_id: shareId,
      sections: data.sections,
      fields: data.fields,
      line_items: lineItems,
    };
    try {
      const existing = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      existing[shareId] = payload;
      localStorage.setItem(STORAGE_KEY, JSON.stringify(existing));
    } catch {}
    setPublishData(payload);
    setPublishOpen(true);
  }, [data, lineItems]);

  const tabLabel = (tab: string) => tab === LINE_ITEMS_TAB ? "Schedule of Requirements" : tab;
  const currentFields = fieldsBySection[activeTab] ?? [];

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r bg-sidebar flex flex-col shrink-0 sticky top-0 h-screen">
        <div className="flex items-center gap-2 px-6 py-5 border-b">
          <div className="w-6 h-6 rounded bg-primary flex items-center justify-center">
            <Sparkles className="w-3.5 h-3.5 text-primary-foreground" />
          </div>
          <span className="font-semibold text-sm">RFQ Parser</span>
        </div>

        <div className="p-3 flex-1 overflow-y-auto">
          <div className="px-3 py-2 mb-1">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sections</p>
          </div>
          <nav className="space-y-0.5">
            {sections.map((tab, i) => {
              const isActive = activeTab === tab;
              const sectionFields = tab === LINE_ITEMS_TAB ? [] : (fieldsBySection[tab] ?? []);
              const required = sectionFields.filter(f => f.required).length;
              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${
                    isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"
                  }`}
                >
                  <span className="flex items-center gap-2 truncate">
                    <span className={`text-xs tabular-nums w-4 ${isActive ? "text-primary-foreground/60" : "text-muted-foreground/50"}`}>{i + 1}</span>
                    <span className="truncate">{tabLabel(tab)}</span>
                  </span>
                  {tab === LINE_ITEMS_TAB ? (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] px-1.5 shrink-0">{lineItems.length}</Badge>
                  ) : required > 0 ? (
                    <Badge variant={isActive ? "secondary" : "outline"} className="text-[10px] px-1.5 shrink-0">{required}</Badge>
                  ) : null}
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-3 border-t space-y-1">
          <div className="px-3 py-2">
            <div className="flex justify-between text-xs text-muted-foreground mb-1.5">
              <span>Progress</span>
              <span>{filledCount}/{data.fields.length}</span>
            </div>
            <div className="h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${(filledCount / Math.max(data.fields.length, 1)) * 100}%` }} />
            </div>
          </div>
          <button onClick={onReset} className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
            <ArrowLeft className="w-4 h-4" />
            New Upload
          </button>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-8 py-4 flex items-center justify-between bg-background sticky top-0 z-10">
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">RFQ Builder</p>
            <h1 className="text-lg font-semibold leading-tight">{data.title}</h1>
          </div>
          <Button onClick={handlePublish} size="sm">
            Publish Form
          </Button>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === LINE_ITEMS_TAB ? (
            <div className="p-8">
              <LineItemsTable items={lineItems} onChange={setLineItems} />
            </div>
          ) : (
            <FormProvider {...form}>
              <form>
                {data.description && activeIndex === 0 && (
                  <div className="px-8 pt-6 pb-0">
                    <p className="text-sm text-muted-foreground leading-relaxed border-l-2 border-primary/40 pl-4">{data.description}</p>
                  </div>
                )}
                {currentFields.length === 0 ? (
                  <div className="p-8 text-center text-muted-foreground text-sm">No fields in this section.</div>
                ) : (
                  currentFields.map((field, idx) => (
                    <div key={field.id}>
                      <div className="px-8 py-6 grid grid-cols-[280px_1fr] gap-12 items-start">
                        <div className="pt-0.5">
                          <p className="text-sm font-medium text-foreground">
                            {field.label}
                            {field.required && <span className="text-destructive ml-1">*</span>}
                          </p>
                          {field.placeholder && (
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{field.placeholder}</p>
                          )}
                          {field.options.length > 0 && field.type !== "dropdown" && (
                            <div className="mt-2 flex flex-wrap gap-1">
                              {field.options.map(o => (
                                <span key={o} className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">{o}</span>
                              ))}
                            </div>
                          )}
                        </div>
                        <div>
                          <DynamicField field={field} control={form.control} />
                        </div>
                      </div>
                      {idx < currentFields.length - 1 && <Separator />}
                    </div>
                  ))
                )}
              </form>
            </FormProvider>
          )}
        </main>

        <footer className="border-t bg-background px-8 py-3 flex items-center justify-between sticky bottom-0 z-10">
          <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => setActiveTab(sections[activeIndex - 1])}>
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">{activeIndex + 1} / {sections.length}</span>
          {activeIndex < sections.length - 1 ? (
            <Button size="sm" onClick={() => setActiveTab(sections[activeIndex + 1])}>
              Next
              <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm" onClick={handlePublish}>Publish Form</Button>
          )}
        </footer>
      </div>

      {publishData && <PublishDialog open={publishOpen} onOpenChange={setPublishOpen} data={publishData} />}
    </div>
  );
}