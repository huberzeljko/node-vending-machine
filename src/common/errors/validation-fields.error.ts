import { BaseError } from 'src/common/errors/base.error';

export class ValidationFieldsError extends BaseError {
  errors: { [key: string]: string };

  constructor(errors: { [key: string]: string }) {
    super('invalid-data', 'Invalid request data');

    this.errors = errors;
  }
}
