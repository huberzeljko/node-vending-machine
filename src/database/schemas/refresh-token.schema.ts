import { EntitySchema } from 'typeorm';
import { RefreshTokenEntity } from '../entities';

export const RefreshTokenSchema = new EntitySchema<RefreshTokenEntity>({
  name: 'refresh_token',
  target: RefreshTokenEntity,
  tableName: 'refresh_token',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    token: {
      type: String,
      unique: true,
    },
    expires: {
      type: Date,
    },
    remoteIpAddress: {
      type: String,
    },
    userId: {
      type: Number,
      nullable: false,
    },
  },
  relations: {
    userId: {
      type: 'many-to-one',
      target: 'user',
      inverseSide: 'refresh_tokens',
      joinColumn: {
        name: 'userId',
      },
      cascade: true,
      onDelete: 'CASCADE',
    },
  },
});
