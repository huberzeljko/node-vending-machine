import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from 'src/config';
import { ProductSchema, RefreshTokenSchema, UserSchema } from 'src/database/schemas';
import { ProductRepository, RefreshTokenRepository } from './repositories';
import { UserRepository } from 'src/database/repositories/user.repository';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (config: ConfigService) => {
        const { host, port, username, password, database } =
          config.get('database');
        return {
          type: 'postgres',
          host: host,
          port: port,
          username: username,
          password: password,
          database: database,
          entities: [UserSchema, ProductSchema, RefreshTokenSchema],
          synchronize: config.get('environment') === 'development',
          autoLoadEntities: true,
          keepConnectionAlive: true
          //logging: ['query', 'error'],
        };
      },
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      UserRepository,
      ProductRepository,
      RefreshTokenRepository,
    ]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}