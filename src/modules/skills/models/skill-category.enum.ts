import { registerEnumType } from '@nestjs/graphql';
import { SkillCategory } from '../../../generated/prisma/enums.js';

registerEnumType(SkillCategory, {
  name: 'SkillCategory',
  description: 'Area a skill belongs to.',
  valuesMap: {
    LANGUAGE: { description: 'Programming or query language.' },
    FRONTEND: {
      description: 'Frontend framework, library, styling or UI practice.',
    },
    BACKEND: { description: 'Backend runtime, framework or API style.' },
    DATABASE: { description: 'Database, ORM or data store.' },
    AI: {
      description:
        'AI and LLM engineering: models, agents, speech and media generation.',
    },
    DEVOPS: {
      description: 'Infrastructure, containers, CI/CD and operations.',
    },
    TESTING: { description: 'Testing framework or practice.' },
    TOOLS: { description: 'Development tool.' },
  },
});

export { SkillCategory };
