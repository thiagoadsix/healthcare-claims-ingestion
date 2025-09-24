import { ClaimsDDbRepository } from '@/infra/repositories/dynamodb/claims.ddb.repository';
import { makeClientDDbRepositoryFactory } from './client.ddb.repository.factory';

export function makeClaimsDDbRepositoryFactory(): ClaimsDDbRepository {
  const clientDDbRepository = makeClientDDbRepositoryFactory();
  return new ClaimsDDbRepository(clientDDbRepository);
}
