import { TokenService } from 'src/features/auth/services';
import { ArgumentMetadata, ForbiddenException, Inject, Injectable, ParseIntPipe, PipeTransform } from '@nestjs/common';

const userIdValueTypePipe = new ParseIntPipe();

@Injectable()
export class EnsureCurrentUserPipe implements PipeTransform {
  constructor(
    private readonly tokenService: TokenService,
    @Inject('REQUEST') private readonly request,
  ) {}

  async transform(value: any, metadata: ArgumentMetadata) {
    const typedValue = await userIdValueTypePipe.transform(value, metadata);

    if (typedValue !== this.request.user.id) {
      throw new ForbiddenException();
    }

    return value;
  }
}