import type DataLoader from 'dataloader';
import type { Education } from '../modules/education/models/education.model.js';
import type { Experience } from '../modules/experience/models/experience.model.js';
import type { ProfileLink } from '../modules/profile/models/profile-link.model.js';
import type { Project } from '../modules/projects/models/project.model.js';
import type { Skill } from '../modules/skills/models/skill.model.js';

export interface Loaders {
  linksByProfileId: DataLoader<string, ProfileLink[]>;
  skillsByProfileId: DataLoader<string, Skill[]>;
  experienceByProfileId: DataLoader<string, Experience[]>;
  educationByProfileId: DataLoader<string, Education[]>;
  projectsByProfileId: DataLoader<string, Project[]>;
  technologiesByExperienceId: DataLoader<string, Skill[]>;
  technologiesByProjectId: DataLoader<string, Skill[]>;
}

export interface GraphQLContext {
  loaders: Loaders;
}
