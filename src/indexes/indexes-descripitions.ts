import { INDEXES_NAMES } from './indexes-names';

import { SearchIndexDescription } from 'mongoose';

export const SEARCH_MESSAGES_INDEX: SearchIndexDescription = {
  name: INDEXES_NAMES.SEARCH_MSGS_ACROSS_CHATS,
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        body: {
          type: 'string',
        },
      },
    },
  },
};

export const SEARCH_CHATS_INDEX: SearchIndexDescription = {
  name: INDEXES_NAMES.SEARCH_CHATS,
  definition: {
    mappings: {
      dynamic: false,
      fields: {
        subject: {
          type: 'string',
        },
      },
    },
  },
};

// chatId обычным индексом
// поиск чатов по subject вместе с msgs
// schema for chat
// aggreg pipline операторы
// создать модуль для общего поиска, делать 2 агререйта для chat subj, msgs. Отображаем в виде чата, с искомым сообщением
