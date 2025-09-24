import { Router } from 'express';

import { makeCreateIngestClaimsFromFileControllerFactory } from '../factories/controllers/ingest-claims-from-file.controller.factory';
import { makeGetClaimByIdControllerFactory } from '../factories/controllers/get-claim-by-id.controller.factory';
import { makeGetClaimsControllerFactory } from '../factories/controllers/get-claims.controller.factory';
import { validateQuery, validateParams } from '../middleware';
import { getClaimsQuerySchema, claimIdParamsSchema } from '../schemas/claims.schemas';

const router = Router();

const ingestClaimsFromFileController = makeCreateIngestClaimsFromFileControllerFactory();
const getClaimByIdController = makeGetClaimByIdControllerFactory();
const getClaimsController = makeGetClaimsControllerFactory();

router.post('/claims', ((req, res) => {
  return ingestClaimsFromFileController.execute(req, res);
}));

router.get('/claims',
  validateQuery(getClaimsQuerySchema),
  ((req, res) => {
    return getClaimsController.execute(req, res);
  })
);

router.get('/claims/:id',
  validateParams(claimIdParamsSchema),
  ((req, res) => {
    return getClaimByIdController.execute(req, res);
  })
);

export default router;