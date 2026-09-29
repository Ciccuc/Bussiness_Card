import {
  Args,
  Context,
  Parent,
  Query,
  ResolveField,
  Resolver,
} from '@nestjs/graphql';
import type { GraphQLContext } from '../../graphql/graphql-context.js';
import { Education } from '../education/models/education.model.js';
import { Experience } from '../experience/models/experience.model.js';
import { Project } from '../projects/models/project.model.js';
import { SkillCategory } from '../skills/models/skill-category.enum.js';
import { Skill } from '../skills/models/skill.model.js';
import { ProfileLink } from './models/profile-link.model.js';
import { Profile } from './models/profile.model.js';
import { ProfileService } from './profile.service.js';

@Resolver(() => Profile)
export class ProfileResolver {
  constructor(private readonly profileService: ProfileService) {}

  @Query(() => Profile, { description: "The business-card owner's profile." })
  profile(): Promise<Profile> {
    return this.profileService.getOwnerProfile();
  }

  @ResolveField('links', () => [ProfileLink], {
    description:
      'Links to GitHub, LinkedIn and other professional resources, in display order.',
  })
  links(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ): Promise<ProfileLink[]> {
    return loaders.linksByProfileId.load(profile.id);
  }

  @ResolveField('skills', () => [Skill], {
    description: 'Skills and technologies in display order.',
  })
  async skills(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
    @Args('category', {
      type: () => SkillCategory,
      nullable: true,
      description: 'Return only the skills of this category.',
    })
    category?: SkillCategory | null,
  ): Promise<Skill[]> {
    const skills = await loaders.skillsByProfileId.load(profile.id);
    if (!category) {
      return skills;
    }
    return skills.filter((skill) => skill.category === category);
  }

  @ResolveField('experience', () => [Experience], {
    description: 'Work history, most recent job first.',
  })
  experience(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ): Promise<Experience[]> {
    return loaders.experienceByProfileId.load(profile.id);
  }

  @ResolveField('education', () => [Education], {
    description: 'Education, most recent degree first.',
  })
  education(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ): Promise<Education[]> {
    return loaders.educationByProfileId.load(profile.id);
  }

  @ResolveField('projects', () => [Project], {
    description: 'Projects in display order.',
  })
  projects(
    @Parent() profile: Profile,
    @Context() { loaders }: GraphQLContext,
  ): Promise<Project[]> {
    return loaders.projectsByProfileId.load(profile.id);
  }
}
