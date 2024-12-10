import { PeopleAddress } from "./people.address.interface";

export interface People {
  id: string;
  company_id: string;
  name: string;
  role: number;
  social_name: string;
  simple: false;
  state_registration_indicator: number;
  state_registration: string;
  municipal_registration: string;
  inscription_suframa: string;
  document: string;
  general_record: string;
  email: string;
  phone_commercial: string;
  phone_cell: string;
  birth: string;
  address?: PeopleAddress;
}
