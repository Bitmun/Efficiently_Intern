import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Chat extends Document {
  @Field(() => String)
  declare public _id: string;

  @Field()
  @Prop({ type: String, required: true })
  public projectId: string;

  @Field(() => [String])
  @Prop({ type: [String], default: [] })
  public memberIds: string[];
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
