import { ValidationPipe as BaseValidationPipe, ValidationPipeOptions } from '@nestjs/common';
import { ValidationError as BaseValidationError } from 'class-validator';
import { ValidationFieldsError } from 'src/common';

export class ValidationPipe extends BaseValidationPipe {
  constructor(options?: ValidationPipeOptions) {
    super({
      exceptionFactory: (errors) => {
        return new ValidationFieldsError(this.buildErrors(errors));
      },
      whitelist: true,
    });
  }

  private buildErrors(errors: BaseValidationError[]) {
    const flattened = errors
      .map((error) => this.mapChildrenToValidationErrors(error))
      .reduce((a, b) => a.concat(b), [])
      .filter((item) => !!item.constraints);

    const result = {};
    flattened.forEach((el) => {
      const prop = el.property;
      Object.entries(el.constraints).forEach((constraint) => {
        result[prop] = `${constraint[1]}`;
      });
    });
    return result;
  }
}

