import { Environment } from './environment.interface';
import { DatabaseConfig } from './database-config.interface';
import { SecurityConfig } from './security-config.interface';

export interface Config {
  baseUrl: string;
  port: number;
  environment: Environment;
  database: DatabaseConfig;
  security: SecurityConfig;
}
