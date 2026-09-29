import { Context, Parent, ResolveField, Resolver } from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { Skill } from '../skills/models/skill.model.js';
import { Experience } from './models/experience.model.js';

@Resolver(() => Experience)
export class ExperienceResolver {
  @ResolveField('technologies', () => [Skill], {
    description: 'Technologies used at this job.',
  })
  technologies(
    @Parent() experience: Experience,
    @Context() { loaders }: GraphQLContext,
  ): Promise<Skill[]> {
    return loaders.technologiesByExperienceId.load(experience.id);
  }
}
