import { Module } from '@nestjs/common';
import { CryptService } from './services';
import { ConfigModule } from 'src/config';

@Module({
  imports: [ConfigModule],
  providers: [CryptService],
  exports: [CryptService],
})
export class CommonModule {}
