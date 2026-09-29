import { HttpException, NotFoundException } from '@nestjs/common';
import { GraphQLError, type GraphQLFormattedError } from 'graphql';
import { createErrorFormatter } from './format-error.js';

function thrownByProfileResolver(exception: Error): GraphQLError {
  return new GraphQLError(exception.message, {
    path: ['profile'],
    originalError: exception,
  });
}

function formattedByApollo(message: string): GraphQLFormattedError {
  return {
    message,
    locations: [{ line: 1, column: 3 }],
    path: ['profile'],
    extensions: { code: 'INTERNAL_SERVER_ERROR', stacktrace: ['at ...'] },
  };
}

const validationError: GraphQLFormattedError = {
  message: 'Cannot query field "age" on type "Profile".',
  extensions: { code: 'GRAPHQL_VALIDATION_FAILED' },
};

describe('createErrorFormatter', () => {
  describe.each([true, false])(
    'with maskUnexpectedErrors = %s',
    (maskUnexpectedErrors) => {
      const formatError = createErrorFormatter({ maskUnexpectedErrors });

      it('names the code of an HTTP exception after its status', () => {
        const exception = new NotFoundException('Profile not found');

        const result = formatError(
          formattedByApollo('Profile not found'),
          thrownByProfileResolver(exception),
        );

        expect(result).toEqual({
          message: 'Profile not found',
          locations: [{ line: 1, column: 3 }],
          path: ['profile'],
          extensions: { code: 'NOT_FOUND', stacktrace: ['at ...'] },
        });
      });

      it('leaves errors reported by GraphQL itself untouched', () => {
        const result = formatError(validationError, new Error('validation'));

        expect(result).toBe(validationError);
      });
    },
  );

  it('uses HTTP_ERROR as the code of an HTTP status that has no name', () => {
    const formatError = createErrorFormatter({ maskUnexpectedErrors: true });
    const exception = new HttpException('Client closed request', 499);

    const result = formatError(
      formattedByApollo('Client closed request'),
      thrownByProfileResolver(exception),
    );

    expect(result.extensions?.code).toBe('HTTP_ERROR');
  });

  it('masks the message and details of an unexpected error', () => {
    const formatError = createErrorFormatter({ maskUnexpectedErrors: true });
    const databaseError = new Error(
      "Invalid `prisma.profile.findFirst()` invocation: Can't reach database server",
    );

    const result = formatError(
      formattedByApollo(databaseError.message),
      thrownByProfileResolver(databaseError),
    );

    expect(result).toEqual({
      message: 'Internal server error',
      locations: [{ line: 1, column: 3 }],
      path: ['profile'],
      extensions: { code: 'INTERNAL_SERVER_ERROR' },
    });
  });

  it('keeps an unexpected error as is when masking is off', () => {
    const formatError = createErrorFormatter({ maskUnexpectedErrors: false });
    const databaseError = new Error("Can't reach database server");
    const formatted = formattedByApollo(databaseError.message);

    const result = formatError(
      formatted,
      thrownByProfileResolver(databaseError),
    );

    expect(result).toBe(formatted);
  });
});
