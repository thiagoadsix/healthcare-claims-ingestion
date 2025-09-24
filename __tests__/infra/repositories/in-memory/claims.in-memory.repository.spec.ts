import { describe, expect, it, beforeEach, afterEach } from "vitest";
import * as fs from 'fs/promises';
import * as path from 'path';
import * as os from 'os';

import { ClaimsInMemoryRepository } from "@/infra/repositories/in-memory/claims.in-memory.repository";
import { Claim } from "@/domain/entities/claim";

describe("ClaimsInMemoryRepository", () => {
  let repository: ClaimsInMemoryRepository;
  let tempDataFile: string;

  beforeEach(async () => {
    tempDataFile = path.join(os.tmpdir(), `claims-test-${Date.now()}.json`);
    repository = new ClaimsInMemoryRepository(tempDataFile);
  });

  afterEach(async () => {
    try {
      await fs.unlink(tempDataFile);
    } catch (error) {
    }
  });

  describe("save", () => {
    it("should save a claim successfully", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51;K21.9"
      });

      await repository.save(claim);

      const savedClaim = await repository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
      expect(savedClaim?.getClaimId()).toBe("CLM001");
      expect(savedClaim?.getMemberId()).toBe("MBR001");
      expect(savedClaim?.getProvider()).toBe("HealthCare Inc");
      expect(savedClaim?.getTotalAmount()).toBe(12500);
    });

    it("should overwrite existing claim with same ID", async () => {
      const claim1 = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51"
      });

      const claim2 = new Claim({
        claimId: "CLM001",
        memberId: "MBR002",
        provider: "Dr. Smith Clinic",
        serviceDate: "2024-01-16",
        totalAmount: 15000,
        diagnosisCodes: "K21.9"
      });

      await repository.save(claim1);
      await repository.save(claim2);

      const savedClaim = await repository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
      expect(savedClaim?.getMemberId()).toBe("MBR002");
      expect(savedClaim?.getProvider()).toBe("Dr. Smith Clinic");
      expect(savedClaim?.getTotalAmount()).toBe(15000);
    });

    it("should save multiple different claims", async () => {
      const claim1 = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51"
      });

      const claim2 = new Claim({
        claimId: "CLM002",
        memberId: "MBR002",
        provider: "Dr. Smith Clinic",
        serviceDate: "2024-01-16",
        totalAmount: 15000,
        diagnosisCodes: "K21.9"
      });

      await repository.save(claim1);
      await repository.save(claim2);

      const savedClaim1 = await repository.findById("CLM001");
      const savedClaim2 = await repository.findById("CLM002");

      expect(savedClaim1).not.toBeNull();
      expect(savedClaim2).not.toBeNull();
      expect(savedClaim1?.getClaimId()).toBe("CLM001");
      expect(savedClaim2?.getClaimId()).toBe("CLM002");
      expect(savedClaim1?.getMemberId()).toBe("MBR001");
      expect(savedClaim2?.getMemberId()).toBe("MBR002");
    });
  });

  describe("findById", () => {
    it("should return null for non-existent claim", async () => {
      const result = await repository.findById("NONEXISTENT");
      expect(result).toBeNull();
    });

    it("should return the correct claim for existing ID", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51;K21.9"
      });

      await repository.save(claim);

      const result = await repository.findById("CLM001");
      expect(result).not.toBeNull();
      expect(result?.getClaimId()).toBe("CLM001");
      expect(result?.getMemberId()).toBe("MBR001");
      expect(result?.getProvider()).toBe("HealthCare Inc");
      expect(result?.getServiceDate()).toEqual(new Date("2024-01-15"));
      expect(result?.getTotalAmount()).toBe(12500);
      expect(result?.getDiagnosisCodes()).toEqual(["R51", "K21.9"]);
    });

    it("should return null for empty string ID", async () => {
      const result = await repository.findById("");
      expect(result).toBeNull();
    });

    it("should be case sensitive for claim IDs", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      await repository.save(claim);

      const result1 = await repository.findById("CLM001");
      const result2 = await repository.findById("clm001");

      expect(result1).not.toBeNull();
      expect(result2).toBeNull();
    });
  });

  describe("Persistence", () => {
    it("should handle empty file gracefully", async () => {
      await fs.writeFile(tempDataFile, "[]", 'utf-8');

      const newRepository = new ClaimsInMemoryRepository(tempDataFile);

      await new Promise(resolve => setTimeout(resolve, 100));

      const result = await newRepository.findById("CLM001");
      expect(result).toBeNull();
    });

    it("should handle corrupted file gracefully", async () => {
      await fs.writeFile(tempDataFile, "invalid json", 'utf-8');

      const newRepository = new ClaimsInMemoryRepository(tempDataFile);

      await new Promise(resolve => setTimeout(resolve, 100));

      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      await newRepository.save(claim);
      const savedClaim = await newRepository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
    });
  });

  describe("Integration Scenarios", () => {
    it("should handle claims with empty diagnosis codes", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      await repository.save(claim);

      const savedClaim = await repository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
      expect(savedClaim?.getDiagnosisCodes()).toEqual([]);
    });

    it("should handle claims with multiple diagnosis codes", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51;K21.9;M54.5;Z00.00"
      });

      await repository.save(claim);

      const savedClaim = await repository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
      expect(savedClaim?.getDiagnosisCodes()).toEqual(["R51", "K21.9", "M54.5", "Z00.00"]);
    });

    it("should handle large amounts correctly", async () => {
      const claim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 99999999,
        diagnosisCodes: ""
      });

      await repository.save(claim);

      const savedClaim = await repository.findById("CLM001");
      expect(savedClaim).not.toBeNull();
      expect(savedClaim?.getTotalAmount()).toBe(99999999);
    });

    it("should maintain data integrity across multiple operations", async () => {
      const claims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: "R51"
        }),
        new Claim({
          claimId: "CLM002",
          memberId: "MBR002",
          provider: "Dr. Smith Clinic",
          serviceDate: "2024-01-16",
          totalAmount: 15000,
          diagnosisCodes: "K21.9"
        }),
        new Claim({
          claimId: "CLM003",
          memberId: "MBR001",
          provider: "City Hospital",
          serviceDate: "2024-01-17",
          totalAmount: 30000,
          diagnosisCodes: "M54.5"
        })
      ];

      for (const claim of claims) {
        await repository.save(claim);
      }

      for (const originalClaim of claims) {
        const savedClaim = await repository.findById(originalClaim.getClaimId());
        expect(savedClaim).not.toBeNull();
        expect(savedClaim?.getClaimId()).toBe(originalClaim.getClaimId());
        expect(savedClaim?.getMemberId()).toBe(originalClaim.getMemberId());
        expect(savedClaim?.getProvider()).toBe(originalClaim.getProvider());
        expect(savedClaim?.getTotalAmount()).toBe(originalClaim.getTotalAmount());
        expect(savedClaim?.getDiagnosisCodes()).toEqual(originalClaim.getDiagnosisCodes());
      }
    });
  });
});
