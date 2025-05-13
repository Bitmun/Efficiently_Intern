import { Message } from './models/message.model';

export interface MessageSendPayload {
  messageSend: Message;
}

export interface MessageDeletedPayload {
  messageDeleted: Message;
}
