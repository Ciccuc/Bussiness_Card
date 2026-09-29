import type { Education as EducationRow } from '../../generated/prisma/client.js';
import type { EducationRepository } from './education.repository.js';
import { EducationService } from './education.service.js';

function fakeRepository(rows: EducationRow[]): EducationRepository {
  const fake: Pick<EducationRepository, 'findByProfileIds'> = {
    findByProfileIds: (profileIds) =>
      Promise.resolve(rows.filter((row) => profileIds.includes(row.profileId))),
  };
  return fake as EducationRepository;
}

function degreeRow(
  id: string,
  profileId: string,
  graduationYear: number,
): EducationRow {
  return {
    id,
    profileId,
    degree: 'BSc',
    fieldOfStudy: 'Computer Science',
    institution: 'State University',
    faculty: null,
    location: null,
    graduationYear,
  };
}

describe('EducationService', () => {
  beforeEach(() => {
    vi.useFakeTimers({ now: new Date('2026-09-28T00:00:00Z') });
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('maps rows to degrees, keeping the stored order', async () => {
    const master: EducationRow = {
      ...degreeRow('e1', 'p1', 2027),
      degree: 'MSc',
      fieldOfStudy: 'Industrial Automation',
      faculty: 'Faculty of Electrical Engineering',
      location: 'Kirov',
    };
    const bachelor = degreeRow('e2', 'p1', 2024);
    const service = new EducationService(fakeRepository([master, bachelor]));

    const degreesPerProfile = await service.getByProfileIds(['p1']);

    expect(degreesPerProfile).toEqual([
      [
        {
          id: 'e1',
          degree: 'MSc',
          fieldOfStudy: 'Industrial Automation',
          institution: 'State University',
          faculty: 'Faculty of Electrical Engineering',
          location: 'Kirov',
          graduationYear: 2027,
          isExpected: true,
        },
        {
          id: 'e2',
          degree: 'BSc',
          fieldOfStudy: 'Computer Science',
          institution: 'State University',
          faculty: null,
          location: null,
          graduationYear: 2024,
          isExpected: false,
        },
      ],
    ]);
  });

  it.each([
    { graduationYear: 2027, isExpected: true },
    { graduationYear: 2026, isExpected: true },
    { graduationYear: 2025, isExpected: false },
  ])(
    'treats a degree of $graduationYear as expected: $isExpected (today is 2026-09-28)',
    async ({ graduationYear, isExpected }) => {
      const service = new EducationService(
        fakeRepository([degreeRow('e1', 'p1', graduationYear)]),
      );

      const [[degree]] = await service.getByProfileIds(['p1']);

      expect(degree?.isExpected).toBe(isExpected);
    },
  );

  it('returns the degrees of each profile at the index of its id', async () => {
    const service = new EducationService(
      fakeRepository([
        degreeRow('e1', 'p1', 2027),
        degreeRow('e2', 'p2', 2020),
        degreeRow('e3', 'p1', 2024),
      ]),
    );

    const degreesPerProfile = await service.getByProfileIds(['p2', 'p3', 'p1']);

    const degreeIdsPerProfile = degreesPerProfile.map((degrees) =>
      degrees.map((degree) => degree.id),
    );
    expect(degreeIdsPerProfile).toEqual([['e2'], [], ['e1', 'e3']]);
  });
});
