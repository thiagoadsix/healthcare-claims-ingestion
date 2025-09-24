export interface CSVRow {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: string;
  diagnosisCodes: string;
}

export interface CSVParseResponse {
  data: CSVRow[];
  errors: Array<{ row: number; message: string }>;
}

export interface CSVParserServiceInterface {
  parse(fileContent: string): Promise<CSVParseResponse>;
}
