import { Company } from "./company.interface";
import { People } from "./people.interface";

export interface User {
  id: string | number;
  company_id: string | number;
  name?: string;
  email: string;
  password: string;
  companies: Company[];
  people: People;
}
