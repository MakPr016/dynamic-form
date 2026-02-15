import type { Control, ControllerRenderProps, FieldValues, FieldError as RHFFieldError } from "react-hook-form";
import { Controller, useFormContext } from "react-hook-form";
import type { RFQField } from "@/types/rfq";
import { FieldError } from "@/components/ui/field";
import { Input } from "@/components/ui/input";
import { InputGroup, InputGroupAddon, InputGroupText, InputGroupTextarea } from "@/components/ui/input-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface DynamicFieldProps {
  field: RFQField;
  control: Control<Record<string, unknown>>;
}

type RenderProps = { field: ControllerRenderProps<FieldValues, string>; fieldState: { invalid: boolean } };

export default function DynamicField({ field, control }: DynamicFieldProps) {
  const { id, type, placeholder, options } = field;
  const { formState: { errors } } = useFormContext<Record<string, unknown>>();
  const fieldError = errors[id] as RHFFieldError | undefined;

  if (type === "checkbox" && options.length > 0) {
    return (
      <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
        <div>
          <div className="space-y-2">
            {options.map((option) => {
              const current = (f.value as string[]) ?? [];
              return (
                <label key={option} className="flex items-center gap-2.5 cursor-pointer group">
                  <Checkbox
                    id={`${id}-${option}`}
                    checked={current.includes(option)}
                    onCheckedChange={(checked) => {
                      f.onChange(checked ? [...current, option] : current.filter((v: string) => v !== option));
                    }}
                  />
                  <span className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">{option}</span>
                </label>
              );
            })}
          </div>
          {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
        </div>
      )} />
    );
  }

  if (type === "checkbox") {
    return (
      <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
        <div>
          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox id={id} checked={!!f.value} onCheckedChange={f.onChange} />
            <span className="text-sm text-muted-foreground">{placeholder || "Yes"}</span>
          </label>
          {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
        </div>
      )} />
    );
  }

  if (type === "dropdown") {
    return (
      <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
        <div>
          <Select onValueChange={f.onChange} defaultValue={f.value as string}>
            <SelectTrigger id={id} aria-invalid={fieldState.invalid} className="w-full">
              <SelectValue placeholder={placeholder || "Select an option"} />
            </SelectTrigger>
            <SelectContent>
              {options.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}
            </SelectContent>
          </Select>
          {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
        </div>
      )} />
    );
  }

  if (type === "textarea") {
    return (
      <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
        <div>
          <InputGroup>
            <InputGroupTextarea
              id={id} placeholder={placeholder} rows={4}
              className="min-h-24 resize-none" aria-invalid={fieldState.invalid}
              value={(f.value as string) ?? ""} onChange={f.onChange} onBlur={f.onBlur} name={f.name}
            />
            <InputGroupAddon align="block-end">
              <InputGroupText className="tabular-nums text-xs">{((f.value as string) ?? "").length} chars</InputGroupText>
            </InputGroupAddon>
          </InputGroup>
          {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
        </div>
      )} />
    );
  }

  if (type === "file") {
    return (
      <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="flex items-center gap-2 px-3 py-2 rounded-lg border border-dashed text-xs text-muted-foreground group-hover:border-primary group-hover:text-foreground transition-colors">
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" /></svg>
              Choose file
            </div>
            <span className="text-xs text-muted-foreground">
              {(f.value instanceof File) ? f.value.name : "No file selected"}
            </span>
            <input type="file" className="hidden" onChange={(e) => f.onChange(e.target.files?.[0] ?? null)} />
          </label>
          {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
        </div>
      )} />
    );
  }

  const inputTypeMap: Record<string, string> = { email: "email", phone: "tel", number: "number", date: "date", text: "text" };

  return (
    <Controller control={control} name={id} render={({ field: f, fieldState }: RenderProps) => (
      <div>
        <Input
          id={id} type={inputTypeMap[type] ?? "text"} placeholder={placeholder}
          aria-invalid={fieldState.invalid}
          value={(f.value as string) ?? ""} onChange={f.onChange} onBlur={f.onBlur} name={f.name}
          className="w-full"
        />
        {fieldState.invalid && <FieldError errors={[fieldError]} className="mt-1.5" />}
      </div>
    )} />
  );
}