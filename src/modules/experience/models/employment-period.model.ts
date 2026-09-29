import { Field, Int, ObjectType } from '@nestjs/graphql';
import { GraphQLDate } from 'graphql-scalars';

@ObjectType({
  description: 'When a job started and ended, and how long it lasted.',
})
export class EmploymentPeriod {
  @Field(() => GraphQLDate, {
    description:
      'Month the job started — the 1st of the month when only the month is known.',
  })
  startDate: Date;

  @Field(() => GraphQLDate, {
    nullable: true,
    description:
      'Month the job ended, same convention; null for the current job.',
  })
  endDate: Date | null;

  @Field(() => Boolean, { description: 'Whether this is the current job.' })
  isCurrent: boolean;

  @Field(() => Int, {
    description:
      'Duration in calendar months, counting the first and the last month (up to today for the current job).',
  })
  durationInMonths: number;
}
