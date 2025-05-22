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
