import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class UnreadMessage extends Document {
  @Field(() => String)
  declare public _id: string;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'Message', required: true })
  public messageId: Types.ObjectId;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  public chatId: Types.ObjectId;

  @Field(() => String)
  @Prop({ type: String, required: true })
  public userId: string;
}

export const UnreadMessageSchema = SchemaFactory.createForClass(UnreadMessage);
