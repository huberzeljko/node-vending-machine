import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Type,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TokenPayload } from 'src/features/auth';
import { NotFoundError } from 'src/common/errors';

type GetRepositoryType<Type> = Type extends Repository<infer X> ? X : never;

export function IsUserCreatorGuard<Entity, T extends Repository<Entity>>(
  type: Type<T>,
  field: keyof GetRepositoryType<T>,
) {
  @Injectable()
  class CreatorGuard implements CanActivate {
    constructor(
      @InjectRepository(type)
      private readonly repository: T,
    ) {}

    async canActivate(context: ExecutionContext): Promise<boolean> {
      const { params, user } = context
        .switchToHttp()
        .getRequest<{ user: TokenPayload; params: { id: number } }>();

      const entity = await this.repository.findOne(params.id);
      if (!entity) {
        throw new NotFoundError('entity/not-found', 'Entity not found');
      }

      // eslint-disable-next-line @typescript-eslint/ban-ts-comment
      // @ts-ignore
      return user.userId == entity[field];
    }
  }

  return CreatorGuard as any;
}
