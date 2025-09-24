import { ClaimsRepositoryInterface, ClaimsRepositoryFilter } from '../../interfaces/repositories';

import { GetClaimsRequest } from './get-claims.request';
import { GetClaimsResponse } from './get-claims.response';

export class GetClaimsUsecase {
  constructor(
    private readonly claimsRepository: ClaimsRepositoryInterface
  ) {}

  async execute(request: GetClaimsRequest): Promise<GetClaimsResponse> {
    const filters: ClaimsRepositoryFilter = {};

    if (request.memberId) {
      filters.memberId = request.memberId;
    }

    if (request.startDate) {
      filters.startDate = new Date(request.startDate);
    }

    if (request.endDate) {
      filters.endDate = new Date(request.endDate);
    }

    const claims = await this.claimsRepository.findWithFilters(filters);

    return {
      claims,
      totalAmount: claims.reduce((sum, claim) => sum + claim.getTotalAmount(), 0)
    };
  }
}
