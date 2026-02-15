import { z } from "zod";
import type { RFQField } from "@/types/rfq";

export function buildZodSchema(fields: RFQField[]) {
  const shape: Record<string, z.ZodTypeAny> = {};

  for (const field of fields) {
    let schema: z.ZodTypeAny;

    switch (field.type) {
      case "email":
        schema = field.required
          ? z.string().min(1, `${field.label} is required`).email("Invalid email address")
          : z.string().email("Invalid email address").optional();
        break;

      case "number": {
        let numSchema = z.coerce.number();
        if (field.validation.min !== null) {
          numSchema = numSchema.min(field.validation.min, `Minimum value is ${field.validation.min}`);
        }
        if (field.validation.max !== null) {
          numSchema = numSchema.max(field.validation.max, `Maximum value is ${field.validation.max}`);
        }
        schema = field.required ? numSchema : numSchema.optional();
        break;
      }

      case "date":
        schema = field.required
          ? z.string().min(1, "Please select a date")
          : z.string().optional();
        break;

      case "checkbox":
        if (field.options.length > 0) {
          schema = field.required
            ? z.array(z.string()).min(1, "Please select at least one option")
            : z.array(z.string()).optional();
        } else {
          schema = z.boolean().optional();
        }
        break;

      case "file":
        schema = field.required
          ? z.instanceof(File, { message: `${field.label} is required` })
          : z.instanceof(File).nullable().optional();
        break;

      case "dropdown":
        schema = field.required
          ? z.string().min(1, `${field.label} is required`)
          : z.string().optional();
        break;

      case "textarea":
      case "phone":
      case "text":
      default: {
        let strSchema = z.string();
        if (field.validation.pattern) {
          strSchema = strSchema.regex(new RegExp(field.validation.pattern), "Invalid format");
        }
        schema = field.required
          ? strSchema.min(1, `${field.label} is required`)
          : strSchema.optional();
        break;
      }
    }

    shape[field.id] = schema;
  }

  return z.object(shape);
}