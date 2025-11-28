
export interface AddressSuggestion {
  label: string;
  city: string;
  state: string;
  zip: string;
}

 export interface ScheduleDay {
  isOpen: boolean;
  start: string;
  end: string;
}

export type WeekDay = "Monday" | "Tuesday" | "Wednesday" | "Thursday" | "Friday" | "Saturday" | "Sunday";

export interface BusinessHoursDetails {
  start: string;
  end: string;
}

export interface BusinessHoursState {
  type: 'daily' | 'weekend' | 'custom';
  details: BusinessHoursDetails;
}

export interface ShopFormData {
  user_id: string;
  shop_name: string;
  shop_description: string;
  address: string;
  city: string;
  state: string;
  zip_code: string;
  latitude: string;
  longitude: string;
  business_hours: BusinessHoursState;
  cover_image_url: string;
  logo_url: string;
}

export interface ValidationErrors {
  [key: string]: string | null;
}

/* --- UI COMPONENT PROPS --- */

export interface CardProps {
  children: React.ReactNode;
  className?: string;
}

export interface LabelProps {
  children: React.ReactNode;
  required?: boolean;
  className?: string;
}

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string | null;
}

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  error?: string | null;
}

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  options: SelectOption[];
}

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "outline" | "ghost" | "destructive";
  size?: "default" | "sm" | "icon";
  loading?: boolean;
}
