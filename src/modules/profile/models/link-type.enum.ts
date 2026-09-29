import { registerEnumType } from '@nestjs/graphql';
import { LinkType } from '../../../generated/prisma/enums.js';

registerEnumType(LinkType, {
  name: 'LinkType',
  description: 'Kind of resource a profile link points to.',
  valuesMap: {
    GITHUB: { description: 'GitHub profile.' },
    LINKEDIN: { description: 'LinkedIn profile.' },
    TELEGRAM: { description: 'Telegram account.' },
    EMAIL: { description: 'E-mail address (a mailto: link).' },
    WEBSITE: { description: 'Personal website or blog.' },
    OTHER: { description: 'Any other professional resource.' },
  },
});

export { LinkType };
