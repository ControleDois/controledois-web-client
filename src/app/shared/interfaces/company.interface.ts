import { Config } from './config.interface';
import { People } from './people.interface';

export interface Company {
  id: number;
  people: People;
  config: Config;
}
