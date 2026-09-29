import { Field, ID, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'The business-card owner: who they are and how to reach them.',
})
export class Profile {
  @Field(() => ID, { description: 'Unique identifier of the profile.' })
  id: string;

  @Field(() => String, { description: 'Full name of the owner.' })
  name: string;

  @Field(() => String, {
    description:
      'One-line professional title, e.g. "Backend developer · Node.js / TypeScript".',
  })
  headline: string;

  @Field(() => String, {
    description: 'Short introduction: what the owner does and values.',
  })
  description: string;

  @Field(() => String, {
    nullable: true,
    description: 'Where the owner is based.',
  })
  location: string | null;

  @Field(() => [String], {
    description:
      'Spoken languages with proficiency, e.g. "English — B2", in display order.',
  })
  languages: string[];

  @Field(() => String, {
    nullable: true,
    description: 'Preferred working arrangement, e.g. "Full-time, remote".',
  })
  workSetup: string | null;
}
