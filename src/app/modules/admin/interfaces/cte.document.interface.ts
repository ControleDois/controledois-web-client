export interface CteDocument {
  role: number;
  mailing_number: string;
  order_number: string;
  model: string;
  series: string;
  icms_calculation_base_value: number;
  total_icms_value: number;
  base_value_calculation_icms_st: number;
  icms_st_value: number;
  cfop: string;
  weight: number;
  access_key: string;
  description_document: string;
  pin_suframa: string;
  delivery_forecast: Date; // Usando o tipo Date em vez de DateTime para compatibilidade com Angular
  number: string;
  issue_date: Date; // Usando o tipo Date em vez de DateTime para compatibilidade com Angular
  total_products: number;
  total_value: number;
}
