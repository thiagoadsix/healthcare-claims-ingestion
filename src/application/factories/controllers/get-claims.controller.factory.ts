import { GetClaimsController } from '../../controllers/get-claims.controller';
import { makeGetClaimsUsecaseFactory } from '../usecases/get-claims.usecase.factory';

export function makeGetClaimsControllerFactory(): GetClaimsController {
  const getClaimsUsecase = makeGetClaimsUsecaseFactory();

  return new GetClaimsController(getClaimsUsecase);
}
