import { EntitySchema } from 'typeorm';
import { ProductEntity } from '../entities';

export const ProductSchema = new EntitySchema<ProductEntity>({
  name: 'product',
  target: ProductEntity,
  tableName: 'product',
  columns: {
    id: {
      type: Number,
      unique: true,
      generated: 'increment',
      nullable: false,
      primary: true,
    },
    productName: {
      type: String,
      nullable: false,
    },
    cost: {
      type: Number,
      nullable: false,
    },
    amountAvailable: {
      type: 'int',
      nullable: false,
    },
    sellerId: {
      type: Number,
      nullable: false,
    },
  },
  relations: {
    sellerId: {
      type: 'many-to-one',
      target: 'user',
      inverseSide: 'products',
      joinColumn: {
        name: 'sellerId',
      },
      cascade: true,
      onDelete: 'CASCADE',
    },
  },
});
