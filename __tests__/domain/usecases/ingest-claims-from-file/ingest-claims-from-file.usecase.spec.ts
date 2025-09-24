import { describe, expect, it, beforeEach, vi } from "vitest";

import { IngestClaimsFromFileUsecase } from "@/domain/usecases/ingest-claims-from-file/ingest-claims-from-file.usecase";
import { CSVParserServiceInterface, CSVParseResponse } from "@/domain/interfaces/services";
import { ClaimsRepositoryInterface } from "@/domain/interfaces/repositories";
import { Claim } from "@/domain/entities/claim";

describe("IngestClaimsFromFileUsecase", () => {
  let usecase: IngestClaimsFromFileUsecase;
  let mockCSVParser: CSVParserServiceInterface;
  let mockRepository: ClaimsRepositoryInterface;

  beforeEach(() => {
    mockCSVParser = {
      parse: vi.fn()
    };

    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn()
    };

    usecase = new IngestClaimsFromFileUsecase(mockCSVParser, mockRepository);
  });

  describe("Success Cases", () => {
    it("should successfully process valid CSV data", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "12500",
            diagnosisCodes: "R51;K21.9"
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await usecase.execute({
        fileContent: "valid,csv,content"
      });

      expect(result.successCount).toBe(1);
      expect(result.errorCount).toBe(0);
      expect(result.errors).toHaveLength(0);
      expect(mockRepository.save).toHaveBeenCalledTimes(1);
    });

    it("should handle multiple valid claims", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "12500",
            diagnosisCodes: "R51"
          },
          {
            claimId: "CLM002",
            memberId: "MBR002",
            provider: "Dr. Smith Clinic",
            serviceDate: "2024-01-14",
            totalAmount: "8999",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await usecase.execute({
        fileContent: "valid,csv,content"
      });

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(0);
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe("Validation Error Cases", () => {
    it("should handle missing required fields", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "",
            memberId: "",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "12500",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);

      const result = await usecase.execute({
        fileContent: "invalid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].message).toContain("Missing claimId");
      expect(result.errors[0].message).toContain("Missing memberId");
      expect(mockRepository.save).not.toHaveBeenCalled();
    });

    it("should handle invalid amount values", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "-100",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);

      const result = await usecase.execute({
        fileContent: "invalid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].message).toContain("Invalid totalAmount");
    });

    it("should handle future service dates", async () => {
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);

      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: futureDate.toISOString().split('T')[0],
            totalAmount: "12500",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);

      const result = await usecase.execute({
        fileContent: "invalid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].message).toContain("Service date cannot be in the future");
    });
  });

  describe("CSV Parsing Error Cases", () => {
    it("should include CSV parsing errors in result", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [],
        errors: [
          { row: 2, message: "Invalid CSV format" },
          { row: 3, message: "Missing column" }
        ]
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);

      const result = await usecase.execute({
        fileContent: "invalid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(2);
      expect(result.errors).toHaveLength(2);
      expect(result.errors[0].message).toBe("Invalid CSV format");
      expect(result.errors[1].message).toBe("Missing column");
    });

    it("should handle CSV parser throwing an error", async () => {
      vi.mocked(mockCSVParser.parse).mockRejectedValue(new Error("Failed to parse CSV"));

      const result = await usecase.execute({
        fileContent: "invalid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].row).toBe(0);
      expect(result.errors[0].message).toBe("Failed to parse CSV");
    });
  });

  describe("Mixed Success and Error Cases", () => {
    it("should handle mix of valid and invalid claims", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "12500",
            diagnosisCodes: "R51"
          },
          {
            claimId: "",
            memberId: "MBR002",
            provider: "Dr. Smith",
            serviceDate: "2024-01-14",
            totalAmount: "8999",
            diagnosisCodes: ""
          },
          {
            claimId: "CLM003",
            memberId: "MBR003",
            provider: "City Hospital",
            serviceDate: "2024-01-13",
            totalAmount: "30000",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);
      vi.mocked(mockRepository.save).mockResolvedValue();

      const result = await usecase.execute({
        fileContent: "mixed,csv,content"
      });

      expect(result.successCount).toBe(2);
      expect(result.errorCount).toBe(1);
      expect(result.errors).toHaveLength(1);
      expect(result.errors[0].row).toBe(3); // Second row (index 1 + 2)
      expect(result.errors[0].message).toContain("Missing claimId");
      expect(mockRepository.save).toHaveBeenCalledTimes(2);
    });
  });

  describe("Repository Error Handling", () => {
    it("should handle repository save errors", async () => {
      const csvParseResult: CSVParseResponse = {
        data: [
          {
            claimId: "CLM001",
            memberId: "MBR001",
            provider: "HealthCare Inc",
            serviceDate: "2024-01-15",
            totalAmount: "12500",
            diagnosisCodes: ""
          }
        ],
        errors: []
      };

      vi.mocked(mockCSVParser.parse).mockResolvedValue(csvParseResult);
      vi.mocked(mockRepository.save).mockRejectedValue(new Error("Database connection failed"));

      const result = await usecase.execute({
        fileContent: "valid,csv,content"
      });

      expect(result.successCount).toBe(0);
      expect(result.errorCount).toBe(1);
      expect(result.errors[0].row).toBe(2);
      expect(result.errors[0].message).toBe("Database connection failed");
    });
  });
});
