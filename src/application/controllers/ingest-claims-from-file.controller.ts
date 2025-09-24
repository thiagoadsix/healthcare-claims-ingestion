import { Request, Response } from 'express';

import { IngestClaimsFromFileUsecase } from '@/domain/usecases/ingest-claims-from-file/ingest-claims-from-file.usecase';
import { IngestClaimsFromFileRequest } from '@/domain/usecases/ingest-claims-from-file/ingest-claims-from-file.request';

export class IngestClaimsFromFileController {
  constructor(
    private readonly ingestClaimsFromFileUsecase: IngestClaimsFromFileUsecase
  ) {}

  async execute(req: Request, res: Response): Promise<void> {
    const file = req.file;

    if (!file) {
      res.status(400).json({
        error: 'No file uploaded',
        message: 'Please upload a CSV file'
      });
      return;
    }

    const fileContent = file.buffer.toString('utf8');

    const request: IngestClaimsFromFileRequest = {
      fileContent,
    };

    const result = await this.ingestClaimsFromFileUsecase.execute(request);

    res.status(200).json({
      successCount: result.successCount,
      errorCount: result.errorCount,
      errors: result.errors
    });
  }
}
