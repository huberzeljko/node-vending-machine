import { EntitySchema } from 'typeorm';
import { UserEntity } from '../entities';

export const UserSchema = new EntitySchema<UserEntity>({
  name: 'user',
  target: UserEntity,
  tableName: 'user',
  columns: {
    id: {
      type: Number,
      primary: true,
      generated: 'increment',
    },
    username: {
      type: String,
      unique: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
    },
    deposit: {
      type: Number,
      nullable: false,
      default: 0,
    },
  },
});
