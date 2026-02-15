import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import type { PublishData, LineItem } from "@/types/rfq";
import { useForm, FormProvider } from "react-hook-form";
import { buildZodSchema } from "@/lib/buildSchema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import DynamicField from "@/components/DynamicField";
import LineItemsTable from "@/components/Lineitemstable";
import { ArrowLeft, ChevronLeft, ChevronRight, Sparkles, AlertCircle } from "lucide-react";

const STORAGE_KEY = "rfq_published_forms";
const LINE_ITEMS_TAB = "__line_items__";

export default function SharedFormPage() {
  const { shareId } = useParams<{ shareId: string }>();
  const [formData, setFormData] = useState<PublishData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [activeTab, setActiveTab] = useState("");
  const [lineItems, setLineItems] = useState<LineItem[]>([]);

  useEffect(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || "{}");
      const found = stored[shareId ?? ""];
      if (found) {
        setFormData(found);
        const hasItems = (found.line_items?.length ?? 0) > 0;
        const tabs = [...found.sections, ...(hasItems ? [LINE_ITEMS_TAB] : [])];
        setActiveTab(tabs[0] ?? "");
        setLineItems((found.line_items ?? []).map((i: LineItem) => ({ ...i })));
      } else {
        setNotFound(true);
      }
    } catch {
      setNotFound(true);
    }
  }, [shareId]);

  const schema = formData ? buildZodSchema(formData.fields) : null;
  const form = useForm<Record<string, unknown>>({
    resolver: schema ? zodResolver(schema) : undefined,
    defaultValues: formData?.fields.reduce<Record<string, unknown>>((acc, f) => {
      if (f.type === "checkbox" && f.options.length > 0) acc[f.id] = [];
      else if (f.type === "checkbox") acc[f.id] = false;
      else if (f.type === "file") acc[f.id] = null;
      else acc[f.id] = "";
      return acc;
    }, {}) ?? {},
    mode: "onBlur",
  });

  if (notFound) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4 max-w-sm">
          <div className="w-12 h-12 rounded-xl bg-destructive/10 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6 text-destructive" />
          </div>
          <h1 className="text-xl font-semibold">Form not found</h1>
          <p className="text-sm text-muted-foreground">
            This shared form could not be found. It may have been created in a different browser, or the link is invalid.
          </p>
          <Link to="/">
            <Button variant="outline" size="sm"><ArrowLeft className="w-4 h-4 mr-2" />Go home</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (!formData || !activeTab) {
    return <div className="min-h-screen bg-background flex items-center justify-center"><div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" /></div>;
  }

  const hasLineItems = (formData.line_items?.length ?? 0) > 0;
  const sections = [...formData.sections, ...(hasLineItems ? [LINE_ITEMS_TAB] : [])];
  const activeIndex = sections.indexOf(activeTab);
  const fieldsBySection = formData.sections.reduce<Record<string, typeof formData.fields>>((acc, s) => {
    acc[s] = formData.fields.filter(f => (f.section || "General") === s);
    return acc;
  }, {});
  const currentFields = fieldsBySection[activeTab] ?? [];
  const tabLabel = (tab: string) => tab === LINE_ITEMS_TAB ? "Schedule of Requirements" : tab;

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
          <div className="px-3 py-2 mb-1"><p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">Sections</p></div>
          <nav className="space-y-0.5">
            {sections.map((tab, i) => (
              <button key={tab} onClick={() => setActiveTab(tab)}
                className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-sm transition-colors text-left ${activeTab === tab ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:text-foreground hover:bg-accent"}`}
              >
                <span className="flex items-center gap-2 truncate">
                  <span className={`text-xs tabular-nums w-4 ${activeTab === tab ? "text-primary-foreground/60" : "text-muted-foreground/50"}`}>{i + 1}</span>
                  <span className="truncate">{tabLabel(tab)}</span>
                </span>
                {tab === LINE_ITEMS_TAB && <Badge variant={activeTab === tab ? "secondary" : "outline"} className="text-[10px] px-1.5 shrink-0">{lineItems.length}</Badge>}
              </button>
            ))}
          </nav>
        </div>
        <div className="p-3 border-t">
          <div className="px-3 py-2 mb-1">
            <Badge variant="outline" className="text-[10px]">Shared Form · {shareId}</Badge>
          </div>
          <Link to="/">
            <button className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground hover:bg-accent transition-colors">
              <ArrowLeft className="w-4 h-4" />New Upload
            </button>
          </Link>
        </div>
      </aside>

      <div className="flex-1 flex flex-col min-w-0">
        <header className="border-b px-8 py-4 bg-background sticky top-0 z-10">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-0.5">Shared RFQ Form</p>
          <h1 className="text-lg font-semibold">{formData.rfq_title}</h1>
        </header>

        <main className="flex-1 overflow-y-auto">
          {activeTab === LINE_ITEMS_TAB ? (
            <div className="p-8"><LineItemsTable items={lineItems} onChange={setLineItems} /></div>
          ) : (
            <FormProvider {...form}>
              <form>
                {currentFields.map((field, idx) => (
                  <div key={field.id}>
                    <div className="px-8 py-6 grid grid-cols-[280px_1fr] gap-12 items-start">
                      <div className="pt-0.5">
                        <p className="text-sm font-medium">{field.label}{field.required && <span className="text-destructive ml-1">*</span>}</p>
                        {field.placeholder && <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{field.placeholder}</p>}
                      </div>
                      <div><DynamicField field={field} control={form.control} /></div>
                    </div>
                    {idx < currentFields.length - 1 && <Separator />}
                  </div>
                ))}
              </form>
            </FormProvider>
          )}
        </main>

        <footer className="border-t bg-background px-8 py-3 flex items-center justify-between sticky bottom-0 z-10">
          <Button variant="ghost" size="sm" disabled={activeIndex === 0} onClick={() => setActiveTab(sections[activeIndex - 1])}>
            <ChevronLeft className="w-4 h-4 mr-1" />Previous
          </Button>
          <span className="text-xs text-muted-foreground tabular-nums">{activeIndex + 1} / {sections.length}</span>
          {activeIndex < sections.length - 1 ? (
            <Button size="sm" onClick={() => setActiveTab(sections[activeIndex + 1])}>
              Next<ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          ) : (
            <Button size="sm">Submit Response</Button>
          )}
        </footer>
      </div>
    </div>
  );
}