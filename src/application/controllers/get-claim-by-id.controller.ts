import { Request, Response } from 'express';

import { GetClaimByIdUsecase } from '@/domain/usecases/get-claim-by-id/get-claim-by-id.usecase';
import { GetClaimByIdRequest } from '@/domain/usecases/get-claim-by-id/get-claim-by-id.request';
import { ClaimIdParams } from '../schemas/claims.schemas';

export class GetClaimByIdController {
  constructor(
    private readonly getClaimByIdUsecase: GetClaimByIdUsecase
  ) { }

  async execute(req: Request, res: Response): Promise<void> {
    const { id: claimId } = req.params as ClaimIdParams;

    const request: GetClaimByIdRequest = {
      claimId
    };

    const result = await this.getClaimByIdUsecase.execute(request);

    res.status(200).json(result.toJSON());
  }
}
