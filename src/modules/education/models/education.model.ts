import { Field, ID, Int, ObjectType } from '@nestjs/graphql';

@ObjectType({
  description: 'A degree of the profile owner, awarded or expected.',
})
export class Education {
  @Field(() => ID, { description: 'Unique identifier of the degree.' })
  id: string;

  @Field(() => String, { description: 'Academic degree, e.g. "MSc".' })
  degree: string;

  @Field(() => String, {
    description: 'Field of study, e.g. "Computer Science".',
  })
  fieldOfStudy: string;

  @Field(() => String, {
    description: 'University or school that awards the degree.',
  })
  institution: string;

  @Field(() => String, {
    nullable: true,
    description: 'Faculty or department within the institution.',
  })
  faculty: string | null;

  @Field(() => String, {
    nullable: true,
    description: 'City the institution is in.',
  })
  location: string | null;

  @Field(() => Int, {
    description: 'Year the degree was awarded or is expected to be.',
  })
  graduationYear: number;

  @Field(() => Boolean, {
    description:
      'Whether the degree is still to be awarded: true until its graduation year is over.',
  })
  isExpected: boolean;
}
