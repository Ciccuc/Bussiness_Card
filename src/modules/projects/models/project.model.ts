import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description:
    'A project of the profile owner; it has a live URL, a repository URL or both.',
})
export class Project {
  @Field(() => ID, { description: 'Unique identifier of the project.' })
  id: string;

  @Field(() => String, { description: 'Project name.' })
  name: string;

  @Field(() => String, {
    nullable: true,
    description: 'What the project does.',
  })
  description: string | null;

  @Field(() => [String], {
    description: 'Key points of the project in display order.',
  })
  highlights: string[];

  @Field(() => String, {
    nullable: true,
    description:
      'What the owner did on the project, e.g. "backend, infrastructure".',
  })
  role: string | null;

  @Field(() => Int, {
    nullable: true,
    description: 'Year the project was built; null when not given.',
  })
  year: number | null;

  @Field(() => String, {
    description:
      'Primary link to the project: the live project when it has one, otherwise its repository.',
  })
  link: string;

  @Field(() => String, {
    nullable: true,
    description: 'Live project or demo; null when there is none.',
  })
  url: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'Source code repository; null when the code is not public.',
  })
  repositoryUrl: string | null;
}
