import { ApolloDriver, type ApolloDriverConfig } from '@nestjs/apollo';
import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { GraphQLModule } from '@nestjs/graphql';
import { validateEnv } from './config/env.validation.js';
import { PrismaModule } from './database/prisma.module.js';
import { createGraphQLConfig } from './graphql/graphql.config.js';
import { LoadersFactory } from './graphql/loaders/loaders.factory.js';
import { LoadersModule } from './graphql/loaders/loaders.module.js';
import { HealthModule } from './health/health.module.js';
import { EducationModule } from './modules/education/education.module.js';
import { ExperienceModule } from './modules/experience/experience.module.js';
import { ProfileModule } from './modules/profile/profile.module.js';
import { ProjectsModule } from './modules/projects/projects.module.js';
import { SkillsModule } from './modules/skills/skills.module.js';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: validateEnv,
      cache: true,
    }),
    PrismaModule,
    GraphQLModule.forRootAsync<ApolloDriverConfig>({
      driver: ApolloDriver,
      imports: [LoadersModule],
      inject: [ConfigService, LoadersFactory],
      useFactory: createGraphQLConfig,
    }),
    HealthModule,
    ProfileModule,
    SkillsModule,
    ExperienceModule,
    EducationModule,
    ProjectsModule,
  ],
})
export class AppModule {}
