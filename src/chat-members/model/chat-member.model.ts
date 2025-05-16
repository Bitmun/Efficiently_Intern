import { Field, ObjectType } from '@nestjs/graphql';
import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';

import { Document, Types } from 'mongoose';

@Schema({ timestamps: true })
@ObjectType()
export class ChatMember extends Document {
  @Field(() => String)
  declare public _id: string;

  @Field(() => String)
  @Prop({ type: Types.ObjectId, ref: 'Chat', required: true })
  public chatId: Types.ObjectId;

  @Field(() => String)
  @Prop({ type: String, required: true })
  public userId: string;

  @Field(() => String, { nullable: true })
  @Prop({ type: Types.ObjectId, ref: 'Message', default: null })
  public lastReadMsgId: string | null;
}

export const ChatMemberSchema = SchemaFactory.createForClass(ChatMember);
