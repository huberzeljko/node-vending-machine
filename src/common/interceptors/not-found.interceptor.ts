import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
  NotFoundException,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';

@Injectable()
export class NotFoundInterceptor implements NestInterceptor {
  constructor(
    private message: string = 'Resource with specified id not found',
  ) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    return next.handle().pipe(
      tap((data) => {
        if (data === undefined || data === null)
          throw new NotFoundException(this.message);
      }),
    );
  }
}
