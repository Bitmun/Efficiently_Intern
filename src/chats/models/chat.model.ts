import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import mongoose, { Document } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Chat extends Document {
  @Field(() => String)
  declare public _id: mongoose.Types.ObjectId;

  @Field()
  @Prop({ type: String, required: true })
  public projectId: string;

  @Field()
  @Prop({ type: String, required: true })
  public subject: string;
}

export const ChatSchema = SchemaFactory.createForClass(Chat);
