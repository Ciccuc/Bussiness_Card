import { ApolloServerPluginLandingPageLocalDefault } from '@apollo/server/plugin/landingPage/default';
import type { ApolloDriverConfig } from '@nestjs/apollo';
import { join } from 'node:path';
import type { ConfigService } from '@nestjs/config';
import type { Env } from '../config/env.validation.js';
import { createErrorFormatter } from './format-error.js';
import type { GraphQLContext } from './graphql-context.js';
import type { LoadersFactory } from './loaders/loaders.factory.js';
import { SANDBOX_EXAMPLE_DOCUMENT } from './sandbox-example.js';

export function createGraphQLConfig(
  config: ConfigService<Env, true>,
  loadersFactory: LoadersFactory,
): ApolloDriverConfig {
  const isProduction = config.get('NODE_ENV', { infer: true }) === 'production';
  const schemaFilePath = join(process.cwd(), 'schema.gql');
  const apolloSandbox = ApolloServerPluginLandingPageLocalDefault({
    embed: true,
    document: SANDBOX_EXAMPLE_DOCUMENT,
  });

  return {
    autoSchemaFile: isProduction ? true : schemaFilePath,
    sortSchema: true,
    introspection: true,
    graphiql: false,
    plugins: [apolloSandbox],
    autoTransformHttpErrors: false,
    formatError: createErrorFormatter({ maskUnexpectedErrors: isProduction }),
    context: (): GraphQLContext => ({ loaders: loadersFactory.create() }),
  };
}
