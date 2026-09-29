import { Injectable } from '@nestjs/common';
import DataLoader from 'dataloader';
import { EducationService } from '../../modules/education/education.service.js';
import { ExperienceService } from '../../modules/experience/experience.service.js';
import { ProfileService } from '../../modules/profile/profile.service.js';
import { ProjectsService } from '../../modules/projects/projects.service.js';
import { SkillsService } from '../../modules/skills/skills.service.js';
import type { Loaders } from '../graphql-context.js';

@Injectable()
export class LoadersFactory {
  constructor(
    private readonly profileService: ProfileService,
    private readonly skillsService: SkillsService,
    private readonly experienceService: ExperienceService,
    private readonly educationService: EducationService,
    private readonly projectsService: ProjectsService,
  ) {}

  create(): Loaders {
    return {
      linksByProfileId: new DataLoader((profileIds) =>
        this.profileService.getLinksByProfileIds([...profileIds]),
      ),
      skillsByProfileId: new DataLoader((profileIds) =>
        this.skillsService.getByProfileIds([...profileIds]),
      ),
      experienceByProfileId: new DataLoader((profileIds) =>
        this.experienceService.getByProfileIds([...profileIds]),
      ),
      educationByProfileId: new DataLoader((profileIds) =>
        this.educationService.getByProfileIds([...profileIds]),
      ),
      projectsByProfileId: new DataLoader((profileIds) =>
        this.projectsService.getByProfileIds([...profileIds]),
      ),
      technologiesByExperienceId: new DataLoader((experienceIds) =>
        this.experienceService.getTechnologiesByExperienceIds([
          ...experienceIds,
        ]),
      ),
      technologiesByProjectId: new DataLoader((projectIds) =>
        this.projectsService.getTechnologiesByProjectIds([...projectIds]),
      ),
    };
  }
}
