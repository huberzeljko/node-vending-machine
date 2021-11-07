import {
  ConfigService as BaseConfigService,
  Path,
  PathValue,
} from '@nestjs/config';
import { Injectable } from '@nestjs/common';
import { Config } from '../interfaces';

@Injectable()
export class ConfigService {
  constructor(private readonly configService: BaseConfigService) {}

  get<P extends Path<Config> = any, R = PathValue<Config, P>>(
    propertyPath: P,
  ): R | undefined {
    return this.configService.get(propertyPath, { infer: true });
  }
}
