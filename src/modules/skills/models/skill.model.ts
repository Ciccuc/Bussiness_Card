import { Field, ID, ObjectType } from '@nestjs/graphql';
import { SkillCategory } from './skill-category.enum.js';

@ObjectType({ description: 'A professional skill or technology.' })
export class Skill {
  @Field(() => ID, { description: 'Unique identifier of the skill.' })
  id: string;

  @Field(() => String, { description: 'Skill name, e.g. "TypeScript".' })
  name: string;

  @Field(() => SkillCategory, { description: 'Area the skill belongs to.' })
  category: SkillCategory;
}
