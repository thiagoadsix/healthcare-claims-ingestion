import { ClientDDbRepository } from '@/infra/repositories/dynamodb/client.ddb.repository';

export function makeClientDDbRepositoryFactory(): ClientDDbRepository {
  return new ClientDDbRepository();
}
