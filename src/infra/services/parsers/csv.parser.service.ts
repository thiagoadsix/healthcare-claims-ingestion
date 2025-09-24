import { parseString, RowMap } from '@fast-csv/parse';

import { CSVRow, CSVParseResponse, CSVParserServiceInterface } from "@/domain/interfaces/services/csv-parser.service.interface";

export class CSVParserService implements CSVParserServiceInterface {
  async parse(fileContent: string): Promise<CSVParseResponse> {
    return new Promise((resolve, reject) => {
      const result: CSVParseResponse = {
        data: [],
        errors: []
      };

      let rowNumber = 0;
      const expectedHeaders = ['claimId', 'memberId', 'provider', 'serviceDate', 'totalAmount', 'diagnosisCodes'];

      parseString(fileContent, {
        headers: true,
        trim: true,
        ignoreEmpty: true,
        strictColumnHandling: false,
        discardUnmappedColumns: false
      })
      .on('error', (error: Error) => {
        result.errors.push({
          row: 0,
          message: `CSV parsing failed: ${error.message}`
        });
        resolve(result);
      })
      .on('headers', (headers: string[]) => {
        const missingHeaders = expectedHeaders.filter(header => !headers.includes(header));
        const extraHeaders = headers.filter(header => !expectedHeaders.includes(header));

        if (missingHeaders.length > 0) {
          result.errors.push({
            row: 1,
            message: `Missing required headers: ${missingHeaders.join(', ')}`
          });
        }

        if (extraHeaders.length > 0) {
          result.errors.push({
            row: 1,
            message: `Unexpected headers found: ${extraHeaders.join(', ')}`
          });
        }
      })
      .on('data', (row) => {
        rowNumber++;
        const csvRowNumber = rowNumber + 1; // +1 because header is row 1

        try {
          const csvRow = this.validateAndMapRow(row);
          if (csvRow) {
            result.data.push(csvRow);
          }
        } catch (error) {
          result.errors.push({
            row: csvRowNumber,
            message: error instanceof Error ? error.message : 'Invalid row format'
          });
        }
      })
      .on('data-invalid', (_row, rowNumber: number) => {
        result.errors.push({
          row: rowNumber + 1, // +1 because header is row 1
          message: 'Invalid row format or insufficient columns'
        });
      })
      .on('end', (totalRows: number) => {
        if (result.data.length === 0 && result.errors.length === 0) {
          result.errors.push({
            row: 0,
            message: 'No valid data found in CSV file'
          });
        }

        resolve(result);
      });
    });
  }

  private validateAndMapRow(row: RowMap): CSVRow | null {
    return {
      claimId: (row.claimId || '').trim(),
      memberId: (row.memberId || '').trim(),
      provider: (row.provider || '').trim(),
      serviceDate: (row.serviceDate || '').trim(),
      totalAmount: (row.totalAmount || '').trim(),
      diagnosisCodes: (row.diagnosisCodes || '').trim()
    };
  }
}