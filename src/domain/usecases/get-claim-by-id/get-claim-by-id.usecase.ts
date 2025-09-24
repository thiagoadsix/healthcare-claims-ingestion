import { NotFoundError } from '@/domain/errors/not-found.error';
import { ClaimsRepositoryInterface } from '../../interfaces/repositories';

import { GetClaimByIdRequest } from './get-claim-by-id.request';
import { GetClaimByIdResponse } from './get-claim-by-id.response';

export class GetClaimByIdUsecase {
  constructor(
    private readonly claimsRepository: ClaimsRepositoryInterface
  ) { }

  async execute(request: GetClaimByIdRequest): Promise<GetClaimByIdResponse> {
    const claim = await this.claimsRepository.findById(request.claimId);

    if (!claim) {
      throw new NotFoundError(`Claim with ID '${request.claimId}' not found`);
    }

    return claim
  }
}
