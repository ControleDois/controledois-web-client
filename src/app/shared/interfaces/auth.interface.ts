import { User } from './user.interface';
import { Config } from './config.interface';
import { Company } from './company.interface';
import { Token } from './token.interface';

export interface Auth {
  token: Token;
  user: User;
  config: Config;
  company: Company;
}
