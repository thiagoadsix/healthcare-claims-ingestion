import { describe, expect, it } from "vitest";
import { Claim, ClaimCTO } from "@/domain/entities/claim";

describe("Claim Entity", () => {
  const createValidClaimData = (): ClaimCTO => ({
    claimId: "CLM001",
    memberId: "MBR001",
    provider: "HealthCare Inc",
    serviceDate: "2024-01-15",
    totalAmount: 12500,
    diagnosisCodes: "R51;K21.9"
  });

  describe("Valid Claim Creation", () => {
    it("should create a claim with all valid data", () => {
      const claimData = createValidClaimData();

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with empty diagnosis codes", () => {
      const claimData = createValidClaimData();
      claimData.diagnosisCodes = "";

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with single diagnosis code", () => {
      const claimData = createValidClaimData();
      claimData.diagnosisCodes = "R51";

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with multiple diagnosis codes", () => {
      const claimData = createValidClaimData();
      claimData.diagnosisCodes = "R51;K21.9;M54.5";

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with service date today", () => {
      const claimData = createValidClaimData();
      claimData.serviceDate = new Date().toISOString().split('T')[0];

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with minimum valid amount (1 cent)", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = 1;

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should create a claim with large valid amount", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = 99999999;

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });

  describe("Service Date Validation", () => {
    it("should throw error when service date is in the future", () => {
      const claimData = createValidClaimData();
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 1);
      claimData.serviceDate = futureDate.toISOString().split('T')[0];

      expect(() => new Claim(claimData)).toThrow("Service date cannot be in the future");
    });

    it("should throw error when service date is far in the future", () => {
      const claimData = createValidClaimData();
      claimData.serviceDate = "2025-12-31";

      expect(() => new Claim(claimData)).toThrow("Service date cannot be in the future");
    });

    it("should accept service date from yesterday", () => {
      const claimData = createValidClaimData();
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      claimData.serviceDate = yesterday.toISOString().split('T')[0];

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should accept service date from last year", () => {
      const claimData = createValidClaimData();
      claimData.serviceDate = "2023-01-01";

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });

  describe("Total Amount Validation", () => {
    it("should throw error when total amount is zero", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = 0;

      expect(() => new Claim(claimData)).toThrow("Invalid totalAmount (must be a positive integer)");
    });

    it("should throw error when total amount is negative", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = -100;

      expect(() => new Claim(claimData)).toThrow("Invalid totalAmount (must be a positive integer)");
    });

    it("should throw error when total amount is large negative number", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = -999999;

      expect(() => new Claim(claimData)).toThrow("Invalid totalAmount (must be a positive integer)");
    });

    it("should accept positive integer amounts", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = 100;

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should accept decimal amounts (will be handled as integers in cents)", () => {
      const claimData = createValidClaimData();
      claimData.totalAmount = 125.50;

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });

  describe("Edge Cases and Boundary Testing", () => {
    it("should handle very long claim IDs", () => {
      const claimData = createValidClaimData();
      claimData.claimId = "CLM" + "0".repeat(100);

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle very long member IDs", () => {
      const claimData = createValidClaimData();
      claimData.memberId = "MBR" + "0".repeat(100);

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle very long provider names", () => {
      const claimData = createValidClaimData();
      claimData.provider = "Very Long Provider Name " + "A".repeat(1000);

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle diagnosis codes with special characters", () => {
      const claimData = createValidClaimData();
      claimData.diagnosisCodes = "R51;K21.9;M54.5;Z00.00";

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle diagnosis codes with spaces", () => {
      const claimData = createValidClaimData();
      claimData.diagnosisCodes = "R51 ; K21.9 ; M54.5";

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });

  describe("Data Type Validation", () => {
    it("should reject string total amount", () => {
      const claimData = createValidClaimData();

      claimData.totalAmount = "12500" as unknown as number;

      expect(() => new Claim(claimData)).toThrow("Invalid totalAmount (must be a positive integer)");
    });

    it("should reject numeric service date", () => {
      const claimData = createValidClaimData();

      claimData.serviceDate = 20240115 as unknown as string;

      expect(() => new Claim(claimData)).toThrow("cto.serviceDate.trim is not a function");
    });
  });

  describe("Business Logic Validation", () => {
    it("should validate that all required fields are present", () => {
      const claimData = createValidClaimData();

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should reject empty strings for required fields", () => {
      const claimData = createValidClaimData();
      claimData.claimId = "";

      expect(() => new Claim(claimData)).toThrow("Missing claimId");
    });

    it("should reject whitespace-only strings for required fields", () => {
      const claimData = createValidClaimData();
      claimData.memberId = "   ";

      expect(() => new Claim(claimData)).toThrow("Missing memberId");
    });

    it("should accept valid required fields", () => {
      const claimData = createValidClaimData();

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });

  describe("Real-world Scenarios", () => {
    it("should handle typical healthcare claim data", () => {
      const claimData: ClaimCTO = {
        claimId: "CLM20240115001",
        memberId: "MBR123456789",
        provider: "City General Hospital",
        serviceDate: "2024-01-15",
        totalAmount: 25000,
        diagnosisCodes: "R51;K21.9;M54.5"
      };

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle urgent care claim", () => {
      const claimData: ClaimCTO = {
        claimId: "UC20240115001",
        memberId: "MBR987654321",
        provider: "QuickMed Urgent Care",
        serviceDate: "2024-01-15",
        totalAmount: 15000,
        diagnosisCodes: "J06.9"
      };

      expect(() => new Claim(claimData)).not.toThrow();
    });

    it("should handle specialist claim", () => {
      const claimData: ClaimCTO = {
        claimId: "SP20240115001",
        memberId: "MBR555666777",
        provider: "Dr. Smith Cardiology Clinic",
        serviceDate: "2024-01-15",
        totalAmount: 50000,
        diagnosisCodes: "I25.10;Z95.1"
      };

      expect(() => new Claim(claimData)).not.toThrow();
    });
  });
});
