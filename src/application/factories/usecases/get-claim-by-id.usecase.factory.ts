import { GetClaimByIdUsecase } from '@/domain/usecases/get-claim-by-id/get-claim-by-id.usecase';
import { makeClaimsDDbRepositoryFactory } from '../repositories/dynamodb';

export function makeGetClaimByIdUsecaseFactory(): GetClaimByIdUsecase {
  const claimsRepository = makeClaimsDDbRepositoryFactory();
  return new GetClaimByIdUsecase(claimsRepository);
}
