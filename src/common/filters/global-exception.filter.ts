import { ArgumentsHost, Catch, ExceptionFilter, HttpException, HttpStatus, } from '@nestjs/common';
import { BaseError, ForbiddenError, NotFoundError, ValidationError, ValidationFieldsError, } from '../errors';
import { ProblemDetails } from 'src/common/interfaces';
import { ConfigService } from 'src/config';
import { randomBytes } from 'crypto';
import { STATUS_CODES } from 'http';
import { slugify } from 'src/common';

const PROBLEM_DOCS_BASE_URI = 'https://vending-machine.com/problems';

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    const { status, code, message, fields } =
      this.getApiResponseError(exception);

    const problemDetails: ProblemDetails = {
      status,
      title: message,
      type: `${PROBLEM_DOCS_BASE_URI}/${code}`,
      instance: this.getInstance(),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (fields) {
      problemDetails['errors'] = fields;
    }

    if (this.configService.get('environment') === 'development') {
      problemDetails['details'] = exception.stack;
    }

    response
      .type('application/problem+json')
      .status(status)
      .json(problemDetails);
  }

  getApiResponseError(exception: unknown): {
    code: string;
    message: string;
    status: number;
    fields: any;
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let code = null;
    let message = null;

    let fields: { [key: string]: string } | null = null;

    if (exception instanceof BaseError) {
      code = exception.code;
      message = exception.message;

      if (exception instanceof NotFoundError) {
        status = HttpStatus.NOT_FOUND;
      } else if (exception instanceof ValidationError) {
        status = HttpStatus.BAD_REQUEST;
      } else if (exception instanceof ValidationFieldsError) {
        status = HttpStatus.BAD_REQUEST;
        fields = exception.errors;
      } else if (exception instanceof ForbiddenError) {
        status = HttpStatus.FORBIDDEN;
      }
    } else if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const statusDescription = STATUS_CODES[status];
    code = code ?? slugify(statusDescription);
    message = message ?? statusDescription;

    return { status, code, message, fields };
  }

  getInstance() {
    return randomBytes(16).toString('hex');
  }
}
