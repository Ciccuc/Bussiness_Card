import { Injectable } from '@nestjs/common';
import { alignGroupsWithKeys } from '../../common/utils/align-groups-with-keys.js';
import type { Experience as ExperienceRow } from '../../generated/prisma/client.js';
import type { Skill } from '../skills/models/skill.model.js';
import { buildEmploymentPeriod } from './employment-period.js';
import { ExperienceRepository } from './experience.repository.js';
import type { Experience } from './models/experience.model.js';

@Injectable()
export class ExperienceService {
  constructor(private readonly experienceRepository: ExperienceRepository) {}

  async getByProfileIds(profileIds: string[]): Promise<Experience[][]> {
    const rows = await this.experienceRepository.findByProfileIds(profileIds);
    const now = new Date();
    const rowsPerProfile = alignGroupsWithKeys(
      profileIds,
      rows,
      (row) => row.profileId,
    );
    return rowsPerProfile.map((profileRows) =>
      profileRows.map((row) => toExperience(row, now)),
    );
  }

  async getTechnologiesByExperienceIds(
    experienceIds: string[],
  ): Promise<Skill[][]> {
    const rows =
      await this.experienceRepository.findTechnologiesByExperienceIds(
        experienceIds,
      );
    const technologiesByExperienceId = new Map(
      rows.map((row) => [row.id, row.technologies]),
    );
    return experienceIds.map((id) => technologiesByExperienceId.get(id) ?? []);
  }
}

function toExperience(row: ExperienceRow, now: Date): Experience {
  return {
    id: row.id,
    company: row.company,
    position: row.position,
    location: row.location,
    description: row.description,
    period: buildEmploymentPeriod(row.startDate, row.endDate, now),
    achievements: row.achievements,
  };
}
