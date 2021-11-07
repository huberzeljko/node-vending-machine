import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { TokenPayload } from 'src/features/auth/interfaces';

export const User = createParamDecorator(
  (data: keyof TokenPayload, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    const user = request.user;

    return data ? user?.[data] : user;
  },
);
