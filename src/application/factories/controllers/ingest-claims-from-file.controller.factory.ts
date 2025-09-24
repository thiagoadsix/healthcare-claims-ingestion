import { IngestClaimsFromFileController } from "@/application/controllers/ingest-claims-from-file.controller";

import { makeCreateIngestClaimsFromFileUsecaseFactory } from "../usecases/ingest-claims-from-file.usecase.factory";

export const makeCreateIngestClaimsFromFileControllerFactory = () => {
  const ingestClaimsFromFileUsecase = makeCreateIngestClaimsFromFileUsecaseFactory();
  return new IngestClaimsFromFileController(ingestClaimsFromFileUsecase);
};