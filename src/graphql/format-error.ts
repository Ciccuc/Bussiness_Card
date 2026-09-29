import {
  ApolloServerErrorCode,
  unwrapResolverError,
} from '@apollo/server/errors';
import { HttpException, HttpStatus } from '@nestjs/common';
import type { GraphQLFormattedError } from 'graphql';

type ErrorFormatter = (
  formattedError: GraphQLFormattedError,
  error: unknown,
) => GraphQLFormattedError;

interface ErrorFormatterOptions {
  maskUnexpectedErrors: boolean;
}

export function createErrorFormatter({
  maskUnexpectedErrors,
}: ErrorFormatterOptions): ErrorFormatter {
  return (formattedError, error) => {
    const exception = unwrapResolverError(error);
    if (exception instanceof HttpException) {
      return withHttpStatusCode(formattedError, exception.getStatus());
    }
    if (maskUnexpectedErrors && isInternalServerError(formattedError)) {
      return maskInternalServerError(formattedError);
    }
    return formattedError;
  };
}

function withHttpStatusCode(
  formattedError: GraphQLFormattedError,
  status: number,
): GraphQLFormattedError {
  return {
    ...formattedError,
    extensions: { ...formattedError.extensions, code: httpStatusName(status) },
  };
}

function httpStatusName(status: number): string {
  return HttpStatus[status] ?? 'HTTP_ERROR';
}

function isInternalServerError(formattedError: GraphQLFormattedError): boolean {
  return (
    formattedError.extensions?.code ===
    ApolloServerErrorCode.INTERNAL_SERVER_ERROR
  );
}

function maskInternalServerError(
  formattedError: GraphQLFormattedError,
): GraphQLFormattedError {
  return {
    message: 'Internal server error',
    locations: formattedError.locations,
    path: formattedError.path,
    extensions: { code: ApolloServerErrorCode.INTERNAL_SERVER_ERROR },
  };
}
