import { Claim, ClaimCTO } from '../../entities/claim';
import { CSVParserServiceInterface, CSVRow } from '../../interfaces/services';
import { ClaimsRepositoryInterface } from '../../interfaces/repositories';

import { IngestClaimsFromFileRequest } from './ingest-claims-from-file.request';
import { IngestClaimsFromFileResponse, IngestionError } from './ingest-claims-from-file.response';

export class IngestClaimsFromFileUsecase {
  constructor(
    private readonly csvParser: CSVParserServiceInterface,
    private readonly claimsRepository: ClaimsRepositoryInterface
  ) {}

  async execute(request: IngestClaimsFromFileRequest): Promise<IngestClaimsFromFileResponse> {
    const result = this.initializeResult();

    try {
      const parseResult = await this.csvParser.parse(request.fileContent)
      this.addParsingErrorsToResult(result, parseResult.errors);

      await this.processCSVRows(parseResult.data, parseResult.errors, result);

    } catch (error) {
      this.addGlobalError(result, error);
    }

    return result;
  }

  private initializeResult(): IngestClaimsFromFileResponse {
    return {
      successCount: 0,
      errorCount: 0,
      errors: []
    };
  }

  private addParsingErrorsToResult(result: IngestClaimsFromFileResponse, errors: IngestionError[]): void {
    result.errors.push(...errors);
    result.errorCount += errors.length;
  }

  private async processCSVRows(
    csvRows: CSVRow[],
    parseErrors: IngestionError[],
    result: IngestClaimsFromFileResponse
  ): Promise<void> {
    for (let i = 0; i < csvRows.length; i++) {
      const csvRow = csvRows[i];
      const rowNumber = this.calculateRowNumber(i);

      await this.processCSVRow(csvRow, rowNumber, parseErrors, result);
    }
  }

  private async processCSVRow(
    csvRow: CSVRow,
    rowNumber: number,
    parseErrors: IngestionError[],
    result: IngestClaimsFromFileResponse
  ): Promise<void> {
    try {
      if (this.hasParsingError(parseErrors, rowNumber)) {
        return;
      }

      const claimData = this.convertCSVRowToClaimData(csvRow);

      if (!this.validateClaimData(claimData, rowNumber, result)) {
        return;
      }

      if (!await this.checkForDuplicates(claimData, rowNumber, result)) {
        return;
      }

      await this.createAndSaveClaim(claimData, result);

    } catch (error) {
      this.addRowError(result, rowNumber, error as Error);
    }
  }

  private calculateRowNumber(arrayIndex: number): number {
    return arrayIndex + 2;
  }

  private hasParsingError(parseErrors: IngestionError[], rowNumber: number): boolean {
    return parseErrors.some(error => error.row === rowNumber);
  }

  private validateClaimData(
    claimData: ClaimCTO,
    rowNumber: number,
    result: IngestClaimsFromFileResponse
  ): boolean {
    const validation = Claim.validate(claimData);

    if (!validation.isValid) {
      this.addRowError(result, rowNumber, validation.errors.join(', '));
      return false;
    }

    return true;
  }

  private async checkForDuplicates(
    claimData: ClaimCTO,
    rowNumber: number,
    result: IngestClaimsFromFileResponse
  ): Promise<boolean> {
    const exists = await this.claimsRepository.findById(claimData.claimId);

    if (exists) {
      this.addRowError(result, rowNumber, `Duplicate claimId: ${claimData.claimId}`);
      return false;
    }

    return true;
  }

  private async createAndSaveClaim(
    claimData: ClaimCTO,
    result: IngestClaimsFromFileResponse
  ): Promise<void> {
    const claim = new Claim(claimData);
    await this.claimsRepository.save(claim);
    result.successCount++;
  }

  private addRowError(
    result: IngestClaimsFromFileResponse,
    rowNumber: number,
    error: string | Error
  ): void {
    const message = error instanceof Error ? error.message : error;

    result.errors.push({
      row: rowNumber,
      message
    });
    result.errorCount++;
  }

  private addGlobalError(result: IngestClaimsFromFileResponse, error: unknown): void {
    const message = error instanceof Error ? error.message : 'Failed to process file';

    result.errors.push({
      row: 0,
      message
    });
    result.errorCount++;
  }

  private convertCSVRowToClaimData(csvRow: CSVRow): ClaimCTO {
    const totalAmount = this.parseAmount(csvRow.totalAmount);

    return {
      claimId: this.sanitizeString(csvRow.claimId),
      memberId: this.sanitizeString(csvRow.memberId),
      provider: this.sanitizeString(csvRow.provider),
      serviceDate: this.sanitizeString(csvRow.serviceDate),
      totalAmount,
      diagnosisCodes: this.sanitizeString(csvRow.diagnosisCodes)
    };
  }

  private parseAmount(amountStr: string): number {
    const amount = parseInt(amountStr, 10);
    return isNaN(amount) ? 0 : amount;
  }

  private sanitizeString(value: string): string {
    return value?.trim() || '';
  }
}