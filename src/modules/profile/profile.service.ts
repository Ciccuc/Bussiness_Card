import { Injectable, NotFoundException } from '@nestjs/common';
import { alignGroupsWithKeys } from '../../common/utils/align-groups-with-keys.js';
import type { ProfileLink } from './models/profile-link.model.js';
import type { Profile } from './models/profile.model.js';
import { ProfileRepository } from './profile.repository.js';

@Injectable()
export class ProfileService {
  constructor(private readonly profileRepository: ProfileRepository) {}

  async getOwnerProfile(): Promise<Profile> {
    const owner = await this.profileRepository.findOwner();
    if (!owner) {
      throw new NotFoundException(
        'The profile has not been created yet: run the database seed',
      );
    }
    return owner;
  }

  async getLinksByProfileIds(profileIds: string[]): Promise<ProfileLink[][]> {
    const links =
      await this.profileRepository.findLinksByProfileIds(profileIds);
    return alignGroupsWithKeys(profileIds, links, (link) => link.profileId);
  }
}
