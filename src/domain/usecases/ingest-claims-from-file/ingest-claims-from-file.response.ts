export interface IngestionError {
  row: number;
  message: string;
}

export interface IngestClaimsFromFileResponse {
  successCount: number;
  errorCount: number;
  errors: IngestionError[];
}