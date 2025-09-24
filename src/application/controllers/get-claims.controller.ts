import { Request, Response } from 'express';

import { GetClaimsUsecase } from '@/domain/usecases/get-claims/get-claims.usecase';
import { GetClaimsRequest } from '@/domain/usecases/get-claims/get-claims.request';
import { GetClaimsQuery } from '../schemas/claims.schemas';

export class GetClaimsController {
  constructor(
    private readonly getClaimsUsecase: GetClaimsUsecase
  ) { }

  async execute(req: Request, res: Response): Promise<void> {
    const { memberId, startDate, endDate, } = req.query as GetClaimsQuery;

    const request: GetClaimsRequest = {
      ...(memberId && { memberId }),
      ...(startDate && { startDate }),
      ...(endDate && { endDate }),
    };

    const result = await this.getClaimsUsecase.execute(request);

    res.status(200).json({
      claims: result.claims.map(c => c.toJSON()),
      totalAmount: result.totalAmount,
    });
  }
}
