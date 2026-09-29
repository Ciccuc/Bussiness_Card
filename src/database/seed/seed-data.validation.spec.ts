import { profileSeedData } from './profile.seed-data.js';
import {
  type ProfileSeedData,
  validateSeedData,
} from './seed-data.validation.js';

function minimalValidData(): ProfileSeedData {
  return {
    slug: 'owner',
    name: 'Jane Doe',
    headline: 'Backend developer',
    description: 'Builds APIs.',
    location: 'Berlin',
    languages: ['German — native', 'English — C1'],
    workSetup: 'Full-time, remote',
    links: [
      { type: 'GITHUB', label: 'GitHub', url: 'https://github.com/jane' },
      { type: 'EMAIL', label: 'E-mail', url: 'mailto:jane@example.com' },
    ],
    skills: [
      { name: 'TypeScript', category: 'LANGUAGE' },
      { name: 'NestJS', category: 'BACKEND' },
    ],
    experience: [
      {
        company: 'Acme',
        position: 'Developer',
        startDate: '2021-06',
        endDate: '2023-02-15',
        achievements: ['Shipped the API.'],
        technologies: ['TypeScript', 'NestJS'],
      },
      {
        company: 'Globex',
        position: 'Senior developer',
        startDate: '2023-03',
        achievements: [],
        technologies: ['NestJS'],
      },
    ],
    education: [
      {
        degree: 'BSc',
        fieldOfStudy: 'Computer Science',
        institution: 'State University',
        graduationYear: 2020,
      },
    ],
    projects: [
      {
        name: 'Card',
        role: 'backend',
        year: 2026,
        repositoryUrl: 'https://github.com/jane/card',
        technologies: ['TypeScript'],
      },
    ],
  };
}

function rejectionMessage(data: ProfileSeedData): string {
  try {
    validateSeedData(data);
  } catch (error) {
    if (error instanceof Error) {
      return error.message;
    }
  }
  throw new Error('expected the seed data to be rejected');
}

function expectProblems(
  data: ProfileSeedData,
  problems: { path: string; message: string }[],
): void {
  const message = rejectionMessage(data);
  expect(message).toMatch(/^Invalid seed data:/);
  for (const problem of problems) {
    expect(message).toContain(`✖ ${problem.message}\n  → at ${problem.path}`);
  }
}

describe('validateSeedData', () => {
  it('accepts the shipped profile data', () => {
    expect(() => validateSeedData(profileSeedData)).not.toThrow();
  });

  it('accepts a card without languages, work setup or education', () => {
    const data = minimalValidData();
    delete data.languages;
    delete data.workSetup;
    data.education = [];

    expect(() => validateSeedData(data)).not.toThrow();
  });

  it('fills omitted optional fields with null or an empty list', () => {
    const data = minimalValidData();
    delete data.location;
    delete data.languages;
    delete data.workSetup;

    const validData = validateSeedData(data);

    expect(validData).toMatchObject({
      location: null,
      languages: [],
      workSetup: null,
    });
    expect(validData.experience[1]).toMatchObject({
      location: null,
      description: null,
      endDate: null,
    });
    expect(validData.education[0]).toMatchObject({
      faculty: null,
      location: null,
    });
    expect(validData.projects[0]).toMatchObject({
      description: null,
      highlights: [],
      url: null,
    });
  });

  it('trims whitespace around text', () => {
    const data = minimalValidData();
    data.name = '  Jane Doe ';
    data.skills[0].name = 'TypeScript ';

    const validData = validateSeedData(data);

    expect(validData.name).toBe('Jane Doe');
    expect(validData.skills[0].name).toBe('TypeScript');
  });

  describe('dates', () => {
    it('converts YYYY-MM to the first day of the month at midnight UTC', () => {
      const validData = validateSeedData(minimalValidData());

      expect(validData.experience[0].startDate).toEqual(
        new Date('2021-06-01T00:00:00Z'),
      );
    });

    it('converts YYYY-MM-DD to that day at midnight UTC', () => {
      const validData = validateSeedData(minimalValidData());

      expect(validData.experience[0].endDate).toEqual(
        new Date('2023-02-15T00:00:00Z'),
      );
    });

    it('accepts a leap day', () => {
      const data = minimalValidData();
      data.experience[1].startDate = '2024-02-29';

      const validData = validateSeedData(data);

      expect(validData.experience[1].startDate).toEqual(
        new Date('2024-02-29T00:00:00Z'),
      );
    });

    it.each([
      '2023-13',
      '2023-00',
      '2023-02-30',
      '2023-02-29',
      '2023-04-31',
      '2023-3',
      '23-03',
      '03.2023',
      '2023-03-01T00:00',
      '',
      'March 2023',
    ])(
      'rejects "%s", which is not an existing YYYY-MM or YYYY-MM-DD date',
      (date) => {
        const data = minimalValidData();
        data.experience[0].startDate = date;

        expectProblems(data, [
          {
            path: 'experience[0].startDate',
            message:
              'must be an existing date written as YYYY-MM or YYYY-MM-DD',
          },
        ]);
      },
    );

    it('rejects an end date earlier than the start date', () => {
      const data = minimalValidData();
      data.experience[0].endDate = '2021-05-31';

      expectProblems(data, [
        {
          path: 'experience[0].endDate',
          message: 'must not be earlier than startDate',
        },
      ]);
    });

    it('reports a nonexistent start date without comparing it with the end date', () => {
      const data = minimalValidData();
      data.experience[0].startDate = '2023-13';
      data.experience[0].endDate = '2021-01';

      const message = rejectionMessage(data);

      expect(message).toContain('→ at experience[0].startDate');
      expect(message).not.toContain('must not be earlier than startDate');
    });

    it('accepts a job that starts and ends in the same month', () => {
      const data = minimalValidData();
      data.experience[0].endDate = '2021-06';

      expect(() => validateSeedData(data)).not.toThrow();
    });
  });

  describe('text', () => {
    it('rejects blank required text and reports every field at once', () => {
      const data = minimalValidData();
      data.name = '';
      data.links[0].label = '   ';
      data.skills.push({ name: ' ', category: 'TOOLS' });
      data.experience[0].position = ' ';
      data.education[0].institution = ' ';
      data.projects[0].name = '';

      expectProblems(data, [
        { path: 'name', message: 'must not be empty' },
        { path: 'links[0].label', message: 'must not be empty' },
        { path: 'skills[2].name', message: 'must not be empty' },
        { path: 'experience[0].position', message: 'must not be empty' },
        { path: 'education[0].institution', message: 'must not be empty' },
        { path: 'projects[0].name', message: 'must not be empty' },
      ]);
    });

    it('rejects optional text that is present but blank', () => {
      const data = minimalValidData();
      data.location = '';
      data.workSetup = ' ';
      data.education[0].faculty = '';
      data.projects[0].description = ' ';
      data.projects[0].role = '';

      expectProblems(data, [
        { path: 'location', message: 'must not be empty' },
        { path: 'workSetup', message: 'must not be empty' },
        { path: 'education[0].faculty', message: 'must not be empty' },
        { path: 'projects[0].description', message: 'must not be empty' },
        { path: 'projects[0].role', message: 'must not be empty' },
      ]);
    });

    it('rejects blank items in languages, achievements and highlights', () => {
      const data = minimalValidData();
      data.languages = ['', 'English — C1'];
      data.experience[0].achievements = ['Shipped the API.', '  '];
      data.projects[0].highlights = ['Ships in one command.', ''];

      expectProblems(data, [
        { path: 'languages[0]', message: 'must not be empty' },
        { path: 'experience[0].achievements[1]', message: 'must not be empty' },
        { path: 'projects[0].highlights[1]', message: 'must not be empty' },
      ]);
    });
  });

  describe('years', () => {
    it.each([20, 20_200, 2020.5, Number.NaN])(
      'rejects %s as a year',
      (year) => {
        const data = minimalValidData();
        data.education[0].graduationYear = year;
        data.projects[0].year = year;

        const message = rejectionMessage(data);

        expect(message).toContain('→ at education[0].graduationYear');
        expect(message).toContain('→ at projects[0].year');
      },
    );
  });

  describe('technologies', () => {
    it('rejects a technology that is not one of the skill names', () => {
      const data = minimalValidData();
      data.experience[1].technologies.push('Nest');
      data.projects[0].technologies = ['typescript'];

      expectProblems(data, [
        {
          path: 'experience[1].technologies',
          message:
            'unknown technology "Nest" (it must be one of the skill names)',
        },
        {
          path: 'projects[0].technologies',
          message:
            'unknown technology "typescript" (it must be one of the skill names)',
        },
      ]);
    });

    it('rejects a technology listed twice in one entry', () => {
      const data = minimalValidData();
      data.experience[0].technologies.push('NestJS');

      expectProblems(data, [
        {
          path: 'experience[0].technologies',
          message: 'duplicate technology "NestJS"',
        },
      ]);
    });
  });

  describe('duplicates', () => {
    it('rejects duplicate skill names', () => {
      const data = minimalValidData();
      data.skills.push({ name: 'NestJS', category: 'TOOLS' });

      expectProblems(data, [
        { path: 'skills', message: 'duplicate skill "NestJS"' },
      ]);
    });

    it('rejects duplicate project names', () => {
      const data = minimalValidData();
      data.projects.push({
        name: 'Card',
        url: 'https://card.example.com',
        technologies: [],
      });

      expectProblems(data, [
        { path: 'projects', message: 'duplicate project "Card"' },
      ]);
    });

    it('rejects duplicate link URLs', () => {
      const data = minimalValidData();
      data.links.push({
        type: 'OTHER',
        label: 'Code',
        url: 'https://github.com/jane',
      });

      expectProblems(data, [
        { path: 'links', message: 'duplicate url "https://github.com/jane"' },
      ]);
    });
  });

  describe('links and URLs', () => {
    it('accepts a project with only a url', () => {
      const data = minimalValidData();
      data.projects.push({
        name: 'Bot',
        url: 'https://t.me/jane_bot',
        highlights: ['Answers in under a second.'],
        technologies: [],
      });

      expect(() => validateSeedData(data)).not.toThrow();
    });

    it('rejects a project without a url or a repositoryUrl', () => {
      const data = minimalValidData();
      delete data.projects[0].repositoryUrl;

      expectProblems(data, [
        { path: 'projects[0]', message: 'needs a url or a repositoryUrl' },
      ]);
    });

    it('rejects URLs that are relative or use an unsupported scheme', () => {
      const data = minimalValidData();
      data.links[0].url = 'github.com/jane';
      data.links[1].url = 'javascript:alert(1)';
      data.projects[0].url = 'htps://card.example.com';

      expectProblems(data, [
        {
          path: 'links[0].url',
          message: 'must be an absolute http(s) or mailto URL',
        },
        {
          path: 'links[1].url',
          message: 'must be an absolute http(s) or mailto URL',
        },
        {
          path: 'projects[0].url',
          message: 'must be an absolute http(s) or mailto URL',
        },
      ]);
    });
  });
});
