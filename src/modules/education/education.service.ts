import { Injectable } from '@nestjs/common';
import { alignGroupsWithKeys } from '../../common/utils/align-groups-with-keys.js';
import type { Education as EducationRow } from '../../generated/prisma/client.js';
import { EducationRepository } from './education.repository.js';
import type { Education } from './models/education.model.js';

@Injectable()
export class EducationService {
  constructor(private readonly educationRepository: EducationRepository) {}

  async getByProfileIds(profileIds: string[]): Promise<Education[][]> {
    const rows = await this.educationRepository.findByProfileIds(profileIds);
    const currentYear = new Date().getUTCFullYear();
    const rowsPerProfile = alignGroupsWithKeys(
      profileIds,
      rows,
      (row) => row.profileId,
    );
    return rowsPerProfile.map((profileRows) =>
      profileRows.map((row) => toEducation(row, currentYear)),
    );
  }
}

function toEducation(row: EducationRow, currentYear: number): Education {
  const graduationYearIsOver = row.graduationYear < currentYear;
  return {
    id: row.id,
    degree: row.degree,
    fieldOfStudy: row.fieldOfStudy,
    institution: row.institution,
    faculty: row.faculty,
    location: row.location,
    graduationYear: row.graduationYear,
    isExpected: !graduationYearIsOver,
  };
}
