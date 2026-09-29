import { Field, ID, ObjectType } from '@nestjs/graphql';
import { EmploymentPeriod } from './employment-period.model.js';

@ObjectType({ description: 'A job in the work history of the profile owner.' })
export class Experience {
  @Field(() => ID, { description: 'Unique identifier of the job.' })
  id: string;

  @Field(() => String, { description: 'Employer name.' })
  company: string;

  @Field(() => String, { description: 'Job title.' })
  position: string;

  @Field(() => String, {
    nullable: true,
    description: 'Where the job is based, e.g. "Moscow (remote)".',
  })
  location: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'What the company or the team does.',
  })
  description: string | null;

  @Field(() => EmploymentPeriod, {
    description: 'When the job started and ended, and how long it lasted.',
  })
  period: EmploymentPeriod;

  @Field(() => [String], {
    description: 'Key achievements in display order.',
  })
  achievements: string[];
}
