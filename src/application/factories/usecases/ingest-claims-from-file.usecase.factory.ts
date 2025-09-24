import { IngestClaimsFromFileUsecase } from "@/domain/usecases/ingest-claims-from-file/ingest-claims-from-file.usecase";
import { makeClaimsDDbRepositoryFactory } from '../repositories/dynamodb';
import { CSVParserService } from "@/infra/services/parsers/csv.parser.service";

export const makeCreateIngestClaimsFromFileUsecaseFactory = () => {
  const csvParser = new CSVParserService();

  const claimsRepository = makeClaimsDDbRepositoryFactory();
  return new IngestClaimsFromFileUsecase(csvParser, claimsRepository);
};