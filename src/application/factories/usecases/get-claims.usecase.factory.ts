import { GetClaimsUsecase } from '@/domain/usecases/get-claims/get-claims.usecase';
import { makeClaimsDDbRepositoryFactory } from '../repositories/dynamodb';

export function makeGetClaimsUsecaseFactory(): GetClaimsUsecase {
  const claimsRepository = makeClaimsDDbRepositoryFactory();
  return new GetClaimsUsecase(claimsRepository);
}
