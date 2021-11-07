import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { getClientIp } from 'request-ip';

export const IpAddress = createParamDecorator(
  (data: any, ctx: ExecutionContext) => {
    const request = ctx.switchToHttp().getRequest();
    return getClientIp(request);
  },
);
