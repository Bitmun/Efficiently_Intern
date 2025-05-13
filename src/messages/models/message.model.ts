import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class Message extends Document {
  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  public chatId: Types.ObjectId;

  @Field()
  @Prop({ type: String, required: true })
  public userId: string;

  @Field()
  @Prop({ type: String, required: true })
  public userLogin: string;

  @Field()
  @Prop({ type: String, required: true })
  public body: string;

  @Field()
  @Prop({ default: false })
  public isDeleted: boolean;
}

export const MessageSchema = SchemaFactory.createForClass(Message);
