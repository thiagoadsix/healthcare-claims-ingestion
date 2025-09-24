import { GetClaimByIdController } from '../../controllers/get-claim-by-id.controller';
import { makeGetClaimByIdUsecaseFactory } from '../usecases/get-claim-by-id.usecase.factory';

export function makeGetClaimByIdControllerFactory(): GetClaimByIdController {
  const getClaimByIdUsecase = makeGetClaimByIdUsecaseFactory();

  return new GetClaimByIdController(getClaimByIdUsecase);
}
