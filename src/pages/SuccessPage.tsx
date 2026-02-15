import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CheckCircle2, RotateCcw } from "lucide-react";

interface SuccessPageProps {
    values: Record<string, unknown>;
    onReset: () => void;
}

export default function SuccessPage({ values, onReset }: SuccessPageProps) {
    const serializable = Object.fromEntries(
        Object.entries(values).map(([k, v]) => [
            k,
            v instanceof File ? `[File: ${v.name}]` : v,
        ])
    );

    return (
        <div className="min-h-screen bg-background flex items-center justify-center px-6">
            <div className="w-full max-w-lg space-y-6">
                <div className="text-center space-y-3">
                    <div className="w-14 h-14 rounded-full bg-green-500/10 flex items-center justify-center mx-auto">
                        <CheckCircle2 className="w-7 h-7 text-green-500" />
                    </div>
                    <h1 className="text-3xl font-bold">Submitted</h1>
                    <p className="text-muted-foreground text-sm">
                        Your RFQ response has been recorded successfully.
                    </p>
                </div>

                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-sm font-medium text-muted-foreground uppercase tracking-widest">
                            Submitted Values
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <pre className="text-xs text-muted-foreground overflow-auto max-h-72 leading-relaxed">
                            {JSON.stringify(serializable, null, 2)}
                        </pre>
                    </CardContent>
                </Card>

                <Button onClick={onReset} className="w-full" variant="outline">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Parse Another RFQ
                </Button>
            </div>
        </div>
    );
}