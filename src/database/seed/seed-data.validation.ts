import { z } from 'zod';
import { LinkType, SkillCategory } from '../../generated/prisma/enums.js';

const YEAR_AND_MONTH = /^\d{4}-\d{2}$/;

const nonBlankText = z.string().trim().min(1, { error: 'must not be empty' });

const optionalText = nonBlankText.nullable().default(null);

const textList = z.array(nonBlankText);

const webOrMailUrl = z.url({
  protocol: /^(https?|mailto)$/,
  error: 'must be an absolute http(s) or mailto URL',
});

const optionalUrl = webOrMailUrl.nullable().default(null);

const fourDigitYear = z.int().min(1000).max(9999);

const existingIsoDate = z.iso.date({
  error: 'must be an existing date written as YYYY-MM or YYYY-MM-DD',
  abort: true,
});

const calendarDate = z
  .string()
  .transform(addFirstDayToYearAndMonth)
  .pipe(existingIsoDate)
  .transform(toMidnightUtc);

const uniqueTechnologyNames = textList.superRefine((names, context) => {
  reportDuplicates(context, names, 'technology');
});

const linkSchema = z.object({
  type: z.enum(LinkType),
  label: nonBlankText,
  url: webOrMailUrl,
});

const skillSchema = z.object({
  name: nonBlankText,
  category: z.enum(SkillCategory),
});

const experienceSchema = z
  .object({
    company: nonBlankText,
    position: nonBlankText,
    location: optionalText,
    description: optionalText,
    startDate: calendarDate,
    endDate: calendarDate.nullable().default(null),
    achievements: textList,
    technologies: uniqueTechnologyNames,
  })
  .refine(
    (experience) =>
      experience.endDate === null ||
      experience.endDate.getTime() >= experience.startDate.getTime(),
    { error: 'must not be earlier than startDate', path: ['endDate'] },
  );

const educationSchema = z.object({
  degree: nonBlankText,
  fieldOfStudy: nonBlankText,
  institution: nonBlankText,
  faculty: optionalText,
  location: optionalText,
  graduationYear: fourDigitYear,
});

const projectSchema = z
  .object({
    name: nonBlankText,
    description: optionalText,
    highlights: textList.default([]),
    role: optionalText,
    year: fourDigitYear.nullable().default(null),
    url: optionalUrl,
    repositoryUrl: optionalUrl,
    technologies: uniqueTechnologyNames,
  })
  .refine((project) => project.url !== null || project.repositoryUrl !== null, {
    error: 'needs a url or a repositoryUrl',
  });

const profileSeedDataSchema = z
  .object({
    slug: nonBlankText,
    name: nonBlankText,
    headline: nonBlankText,
    description: nonBlankText,
    location: optionalText,
    languages: textList.default([]),
    workSetup: optionalText,
    links: z.array(linkSchema).superRefine((links, context) => {
      const urls = links.map((link) => link.url);
      reportDuplicates(context, urls, 'url');
    }),
    skills: z.array(skillSchema).superRefine((skills, context) => {
      const names = skills.map((skill) => skill.name);
      reportDuplicates(context, names, 'skill');
    }),
    experience: z.array(experienceSchema),
    education: z.array(educationSchema),
    projects: z.array(projectSchema).superRefine((projects, context) => {
      const names = projects.map((project) => project.name);
      reportDuplicates(context, names, 'project');
    }),
  })
  .superRefine((data, context) => {
    const skillNames = new Set(data.skills.map((skill) => skill.name));
    for (const [index, experience] of data.experience.entries()) {
      reportUnknownTechnologies(
        context,
        ['experience', index, 'technologies'],
        experience.technologies,
        skillNames,
      );
    }
    for (const [index, project] of data.projects.entries()) {
      reportUnknownTechnologies(
        context,
        ['projects', index, 'technologies'],
        project.technologies,
        skillNames,
      );
    }
  });

export type ProfileSeedData = z.input<typeof profileSeedDataSchema>;

export type ValidatedProfileSeedData = z.output<typeof profileSeedDataSchema>;

export function validateSeedData(
  data: ProfileSeedData,
): ValidatedProfileSeedData {
  const result = profileSeedDataSchema.safeParse(data);
  if (!result.success) {
    throw new Error(`Invalid seed data:\n${z.prettifyError(result.error)}`);
  }
  return result.data;
}

function addFirstDayToYearAndMonth(date: string): string {
  if (YEAR_AND_MONTH.test(date)) {
    return `${date}-01`;
  }
  return date;
}

function toMidnightUtc(isoDate: string): Date {
  return new Date(`${isoDate}T00:00:00Z`);
}

function reportDuplicates(
  context: z.RefinementCtx,
  values: string[],
  valueName: string,
): void {
  for (const duplicate of findDuplicates(values)) {
    context.addIssue({
      code: 'custom',
      message: `duplicate ${valueName} "${duplicate}"`,
    });
  }
}

function reportUnknownTechnologies(
  context: z.RefinementCtx,
  path: (string | number)[],
  technologies: string[],
  skillNames: Set<string>,
): void {
  for (const technology of technologies) {
    if (!skillNames.has(technology)) {
      context.addIssue({
        code: 'custom',
        path,
        message: `unknown technology "${technology}" (it must be one of the skill names)`,
      });
    }
  }
}

function findDuplicates(values: string[]): string[] {
  const seen = new Set<string>();
  const duplicates = new Set<string>();
  for (const value of values) {
    if (seen.has(value)) {
      duplicates.add(value);
    }
    seen.add(value);
  }
  return [...duplicates];
}
