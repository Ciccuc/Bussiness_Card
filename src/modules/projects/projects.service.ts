import { Injectable } from '@nestjs/common';
import { alignGroupsWithKeys } from '../../common/utils/align-groups-with-keys.js';
import type { Project as ProjectRow } from '../../generated/prisma/client.js';
import type { Skill } from '../skills/models/skill.model.js';
import type { Project } from './models/project.model.js';
import { ProjectsRepository } from './projects.repository.js';

@Injectable()
export class ProjectsService {
  constructor(private readonly projectsRepository: ProjectsRepository) {}

  async getByProfileIds(profileIds: string[]): Promise<Project[][]> {
    const rows = await this.projectsRepository.findByProfileIds(profileIds);
    const rowsPerProfile = alignGroupsWithKeys(
      profileIds,
      rows,
      (row) => row.profileId,
    );
    return rowsPerProfile.map((profileRows) => profileRows.map(toProject));
  }

  async getTechnologiesByProjectIds(projectIds: string[]): Promise<Skill[][]> {
    const rows =
      await this.projectsRepository.findTechnologiesByProjectIds(projectIds);
    const technologiesByProjectId = new Map(
      rows.map((row) => [row.id, row.technologies]),
    );
    return projectIds.map((id) => technologiesByProjectId.get(id) ?? []);
  }
}

function toProject(row: ProjectRow): Project {
  return {
    id: row.id,
    name: row.name,
    description: row.description,
    highlights: row.highlights,
    role: row.role,
    year: row.year,
    link: primaryLinkOf(row),
    url: row.url,
    repositoryUrl: row.repositoryUrl,
  };
}

function primaryLinkOf(row: ProjectRow): string {
  const link = row.url ?? row.repositoryUrl;
  if (link === null) {
    throw new Error(
      `Project ${row.id} violates projects_url_or_repository_url_check: neither url nor repositoryUrl is set`,
    );
  }
  return link;
}
