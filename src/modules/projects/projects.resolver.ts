import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { Skill } from '../skills/models/skill.model.js';
import { Project } from './models/project.model.js';

@Resolver(() => Project)
export class ProjectsResolver {
  @ResolveField('technologies', () => [Skill], {
    description: 'Technologies the project is built with.',
  })
  technologies(
    @Parent() project: Project,
    @Context() { loaders }: GraphQLContext,
  ): Promise<Skill[]> {
    return loaders.technologiesByProjectId.load(project.id);
  }
}
