import { Module } from '@nestjs/common';
import { ConfigModule as BaseConfigModule } from '@nestjs/config';
import configuration from './configuration';
import { ConfigService } from './services';

const ENV = process.env.NODE_ENV;

@Module({
  imports: [
    BaseConfigModule.forRoot({
      load: [configuration],
      envFilePath: !ENV ? '.env' : `.env.${ENV}`,
    }),
  ],
  providers: [ConfigService],
  exports: [ConfigService],
})
export class ConfigModule {}
