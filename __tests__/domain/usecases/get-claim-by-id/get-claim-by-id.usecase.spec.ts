import { describe, expect, it, beforeEach, vi } from "vitest";

import { GetClaimByIdUsecase } from "@/domain/usecases/get-claim-by-id/get-claim-by-id.usecase";
import { ClaimsRepositoryInterface } from "@/domain/interfaces/repositories";
import { Claim } from "@/domain/entities/claim";
import { NotFoundError } from "@/domain/errors/not-found.error";

describe("GetClaimByIdUsecase", () => {
  let usecase: GetClaimByIdUsecase;
  let mockRepository: ClaimsRepositoryInterface;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn()
    };

    usecase = new GetClaimByIdUsecase(mockRepository);
  });

  describe("Success Cases", () => {
    it("should return claim when found", async () => {
      const mockClaim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: "R51;K21.9"
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      const result = await usecase.execute({
        claimId: "CLM001"
      });

      expect(result).toBe(mockClaim);
      expect(result.getClaimId()).toBe("CLM001");
      expect(result.getMemberId()).toBe("MBR001");
      expect(result.getProvider()).toBe("HealthCare Inc");
      expect(result.getTotalAmount()).toBe(12500);
      expect(result.getDiagnosisCodes()).toEqual(["R51", "K21.9"]);
      expect(mockRepository.findById).toHaveBeenCalledWith("CLM001");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should return claim with empty diagnosis codes", async () => {
      const mockClaim = new Claim({
        claimId: "CLM002",
        memberId: "MBR002",
        provider: "Dr. Smith Clinic",
        serviceDate: "2024-01-14",
        totalAmount: 8999,
        diagnosisCodes: ""
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      const result = await usecase.execute({
        claimId: "CLM002"
      });

      expect(result).toBe(mockClaim);
      expect(result.getClaimId()).toBe("CLM002");
      expect(result.getDiagnosisCodes()).toEqual([]);
      expect(mockRepository.findById).toHaveBeenCalledWith("CLM002");
    });

    it("should return claim with single diagnosis code", async () => {
      const mockClaim = new Claim({
        claimId: "CLM003",
        memberId: "MBR003",
        provider: "City Hospital",
        serviceDate: "2024-01-13",
        totalAmount: 30000,
        diagnosisCodes: "M54.5"
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      const result = await usecase.execute({
        claimId: "CLM003"
      });

      expect(result).toBe(mockClaim);
      expect(result.getDiagnosisCodes()).toEqual(["M54.5"]);
      expect(mockRepository.findById).toHaveBeenCalledWith("CLM003");
    });
  });

  describe("Error Cases", () => {
    it("should throw NotFoundError when claim is not found", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: "CLM999"
      })).rejects.toThrow(NotFoundError);

      await expect(usecase.execute({
        claimId: "CLM999"
      })).rejects.toThrow("Claim with ID 'CLM999' not found");

      expect(mockRepository.findById).toHaveBeenCalledWith("CLM999");
    });

    it("should throw NotFoundError with correct error properties", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      try {
        await usecase.execute({
          claimId: "CLM999"
        });
        expect.fail("Expected NotFoundError to be thrown");
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundError);
        expect(error).toHaveProperty("name", "NotFoundError");
        expect(error).toHaveProperty("statusCode", 404);
        expect(error).toHaveProperty("code", "NOT_FOUND");
        expect(error).toHaveProperty("message", "Claim with ID 'CLM999' not found");
      }
    });

    it("should handle empty claimId", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: ""
      })).rejects.toThrow(NotFoundError);

      await expect(usecase.execute({
        claimId: ""
      })).rejects.toThrow("Claim with ID '' not found");

      expect(mockRepository.findById).toHaveBeenCalledWith("");
    });

    it("should handle repository errors", async () => {
      const repositoryError = new Error("Database connection failed");
      vi.mocked(mockRepository.findById).mockRejectedValue(repositoryError);

      await expect(usecase.execute({
        claimId: "CLM001"
      })).rejects.toThrow("Database connection failed");

      expect(mockRepository.findById).toHaveBeenCalledWith("CLM001");
    });

    it("should handle repository timeout errors", async () => {
      const timeoutError = new Error("Query timeout");
      vi.mocked(mockRepository.findById).mockRejectedValue(timeoutError);

      await expect(usecase.execute({
        claimId: "CLM001"
      })).rejects.toThrow("Query timeout");

      expect(mockRepository.findById).toHaveBeenCalledWith("CLM001");
    });
  });

  describe("Input Validation", () => {
    it("should handle undefined claimId", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: undefined as unknown as string
      })).rejects.toThrow(NotFoundError);

      await expect(usecase.execute({
        claimId: undefined as unknown as string
      })).rejects.toThrow("Claim with ID 'undefined' not found");

      expect(mockRepository.findById).toHaveBeenCalledWith(undefined);
    });

    it("should handle null claimId", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: null as unknown as string
      })).rejects.toThrow(NotFoundError);

      await expect(usecase.execute({
        claimId: null as unknown as string
      })).rejects.toThrow("Claim with ID 'null' not found");

      expect(mockRepository.findById).toHaveBeenCalledWith(null);
    });

    it("should handle numeric claimId", async () => {
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: 123 as unknown as string
      })).rejects.toThrow(NotFoundError);

      await expect(usecase.execute({
        claimId: 123 as unknown as string
      })).rejects.toThrow("Claim with ID '123' not found");

      expect(mockRepository.findById).toHaveBeenCalledWith(123);
    });
  });

  describe("Repository Interaction", () => {
    it("should call repository with exact claimId", async () => {
      const mockClaim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      await usecase.execute({
        claimId: "CLM001"
      });

      expect(mockRepository.findById).toHaveBeenCalledWith("CLM001");
      expect(mockRepository.findById).toHaveBeenCalledTimes(1);
    });

    it("should not call save method", async () => {
      const mockClaim = new Claim({
        claimId: "CLM001",
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      await usecase.execute({
        claimId: "CLM001"
      });

      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe("Edge Cases", () => {
    it("should handle claim with special characters in ID", async () => {
      const specialId = "CLM-001_Special@#$";
      const mockClaim = new Claim({
        claimId: specialId,
        memberId: "MBR001",
        provider: "HealthCare Inc",
        serviceDate: "2024-01-15",
        totalAmount: 12500,
        diagnosisCodes: ""
      });

      vi.mocked(mockRepository.findById).mockResolvedValue(mockClaim);

      const result = await usecase.execute({
        claimId: specialId
      });

      expect(result.getClaimId()).toBe(specialId);
      expect(mockRepository.findById).toHaveBeenCalledWith(specialId);
    });

    it("should handle very long claimId", async () => {
      const longId = "CLM" + "0".repeat(1000);
      vi.mocked(mockRepository.findById).mockResolvedValue(null);

      await expect(usecase.execute({
        claimId: longId
      })).rejects.toThrow(NotFoundError);

      expect(mockRepository.findById).toHaveBeenCalledWith(longId);
    });
  });
});
