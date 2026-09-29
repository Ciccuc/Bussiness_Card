import { Field, ID, ObjectType } from '@nestjs/graphql';
import { LinkType } from './link-type.enum.js';

@ObjectType({
  description: 'A link to a professional resource of the profile owner.',
})
export class ProfileLink {
  @Field(() => ID, { description: 'Unique identifier of the link.' })
  id: string;

  @Field(() => LinkType, {
    description: 'Kind of resource the link points to.',
  })
  type: LinkType;

  @Field(() => String, {
    description: 'Human-readable caption, e.g. "GitHub".',
  })
  label: string;

  @Field(() => String, { description: 'Absolute URL of the resource.' })
  url: string;
}
