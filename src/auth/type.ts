import { GraphQLExecutionContext } from '@nestjs/graphql';

import { Request, Response } from 'express';

export interface JwtTokenPayload {
  login: string;
  id: number;
}

export type GraphQLContext = GraphQLExecutionContext & {
  req: Request;
  res: Response;
};
