import { Injectable } from '@nestjs/common';
import { alignGroupsWithKeys } from '../../common/utils/align-groups-with-keys.js';
import type { Skill } from './models/skill.model.js';
import { SkillsRepository } from './skills.repository.js';

@Injectable()
export class SkillsService {
  constructor(private readonly skillsRepository: SkillsRepository) {}

  async getByProfileIds(profileIds: string[]): Promise<Skill[][]> {
    const skills = await this.skillsRepository.findByProfileIds(profileIds);
    return alignGroupsWithKeys(profileIds, skills, (skill) => skill.profileId);
  }
}
