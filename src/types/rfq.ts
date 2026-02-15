export type FieldType =
  | "text"
  | "number"
  | "date"
  | "email"
  | "phone"
  | "textarea"
  | "dropdown"
  | "checkbox"
  | "file";

export interface FieldValidation {
  min: number | null;
  max: number | null;
  pattern: string | null;
}

export interface RFQField {
  id: string;
  label: string;
  type: FieldType;
  required: boolean;
  default_value: string | null;
  placeholder: string;
  options: string[];
  validation: FieldValidation;
  section: string;
}

export interface LineItem {
  sr: number;
  description: string;
  unit: string;
  qty: number;
  unit_price: number | null;
  total_price: number | null;
  brand: string;
  expiry_date: string;
  remarks: string;
}

export interface RFQData {
  title: string;
  description: string;
  fields: RFQField[];
  sections: string[];
  line_items?: LineItem[];
}

export interface PublishData {
  rfq_title: string;
  published_at: string;
  share_id: string;
  sections: string[];
  fields: RFQField[];
  line_items: LineItem[];
}

export type FormValues = Record<string, string | string[] | boolean | File | null>;