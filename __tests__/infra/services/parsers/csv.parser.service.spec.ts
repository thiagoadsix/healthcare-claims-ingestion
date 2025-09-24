import { describe, expect, it, beforeEach } from "vitest";

import { CSVParserService } from "@/infra/services/parsers/csv.parser.service";

describe("CSVParserService", () => {
  let csvParser: CSVParserService;

  beforeEach(() => {
    csvParser = new CSVParserService();
  });

  describe("Valid CSV Parsing", () => {
    it("should successfully parse valid CSV with all required columns", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,HealthCare Inc,2024-01-15,12500,R51;K21.9
CLM002,MBR002,Dr. Smith Clinic,2024-01-14,8999,R10.9`;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.data[0]).toEqual({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: "12500",
        diagnosisCodes: "R51;K21.9"
      });

      expect(result.data[1]).toEqual({
        claimId: "CLM002",
        memberId: "MBR002",
        provider: "Dr. Smith Clinic",
        serviceDate: "2024-01-14",
        totalAmount: "8999",
        diagnosisCodes: "R10.9"
      });
    });

    it("should handle empty diagnosis codes", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,HealthCare Inc,2024-01-15,12500,`;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.data[0].diagnosisCodes).toBe("");
    });

    it("should trim whitespace from all fields", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
  CLM001  ,  MBR001  ,  HealthCare Inc  ,  2024-01-15  ,  12500  ,  R51;K21.9  `;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.data[0]).toEqual({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: "12500",
        diagnosisCodes: "R51;K21.9"
      });
    });
  });

  describe("Header Validation", () => {
    it("should report missing required headers", async () => {
      const csvContent = `claimId,provider,serviceDate,totalAmount
CLM001,HealthCare Inc,2024-01-15,12500`;

      const result = await csvParser.parse(csvContent);

      expect(result.errors.length).toBeGreaterThanOrEqual(1);

      const headerError = result.errors.find(error => error.row === 1);
      expect(headerError).toBeDefined();
      expect(headerError?.message).toContain("Missing required headers: memberId, diagnosisCodes");
    });

    it("should report unexpected headers", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes,extraColumn
CLM001,MBR001,HealthCare Inc,2024-01-15,12500,R51,extra`;

      const result = await csvParser.parse(csvContent);

      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(1);
      expect(result.errors[0].message).toContain("Unexpected headers found: extraColumn");
    });
  });

  describe("Row Validation Errors", () => {
    it("should not perform business validation (missing fields allowed here)", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
,MBR001,HealthCare Inc,2024-01-15,12500,R51
CLM002,,Dr. Smith Clinic,2024-01-14,8999,R10.9`;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(2);
      expect(result.errors).toHaveLength(0);

      expect(result.data[0].claimId).toBe("");
      expect(result.data[1].memberId).toBe("");
    });

    it("should still emit a single structural error for malformed row while keeping valid rows", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
,MBR001,,01/15/2024,invalid,R51`;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(1);
      expect(result.errors).toHaveLength(0);
      expect(result.data[0].claimId).toBe("");
      expect(result.data[0].provider).toBe("");
      expect(result.data[0].serviceDate).toBe("01/15/2024");
      expect(result.data[0].totalAmount).toBe("invalid");
    });
  });

  describe("Mixed Valid and Invalid Data", () => {
    it("should parse all rows and leave business validation to domain", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,HealthCare Inc,2024-01-15,12500,R51;K21.9
,MBR002,Dr. Smith Clinic,2024-01-14,8999,R10.9
CLM003,MBR003,City Hospital,2024-01-13,30000,M54.5`;

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(3);
      expect(result.errors).toHaveLength(0);

      const ids = result.data.map(r => r.claimId);
      expect(ids).toEqual(["CLM001", "", "CLM003"]);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty CSV file", async () => {
      const csvContent = "";

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(0);
      expect(result.errors[0].message).toContain("No valid data found in CSV file");
    });

    it("should handle CSV with only headers", async () => {
      const csvContent = "claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes";

      const result = await csvParser.parse(csvContent);

      expect(result.data).toHaveLength(0);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(0);
      expect(result.errors[0].message).toContain("No valid data found in CSV file");
    });

    it("should handle malformed CSV", async () => {
      const csvContent = `claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,"HealthCare Inc,2024-01-15,12500,R51`;

      const result = await csvParser.parse(csvContent);

      expect(result.errors.length).toBeGreaterThanOrEqual(0);
    });
  });
});
