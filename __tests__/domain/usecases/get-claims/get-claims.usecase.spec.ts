import { describe, expect, it, beforeEach, vi } from "vitest";

import { GetClaimsUsecase } from "@/domain/usecases/get-claims/get-claims.usecase";
import { ClaimsRepositoryInterface, ClaimsRepositoryFilter } from "@/domain/interfaces/repositories";
import { Claim } from "@/domain/entities/claim";

describe("GetClaimsUsecase", () => {
  let usecase: GetClaimsUsecase;
  let mockRepository: ClaimsRepositoryInterface;

  beforeEach(() => {
    mockRepository = {
      save: vi.fn(),
      findById: vi.fn(),
      findWithFilters: vi.fn()
    };

    usecase = new GetClaimsUsecase(mockRepository);
  });

  describe("Success Cases", () => {
    it("should return all claims when no filters are provided", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: "R51;K21.9"
        }),
        new Claim({
          claimId: "CLM002",
          memberId: "MBR002",
          provider: "Dr. Smith Clinic",
          serviceDate: "2024-01-14",
          totalAmount: 8999,
          diagnosisCodes: ""
        })
      ];

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({});

      expect(result.claims).toEqual(mockClaims);
      expect(result.claims).toHaveLength(2);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
      expect(mockRepository.findWithFilters).toHaveBeenCalledTimes(1);
    });

    it("should filter claims by memberId", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: "R51"
        })
      ];

      const expectedFilters: ClaimsRepositoryFilter = {
        memberId: "MBR001"
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({
        memberId: "MBR001"
      });

      expect(result.claims).toEqual(mockClaims);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });

    it("should filter claims by startDate", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: ""
        })
      ];

      const startDate = "2024-01-01";
      const expectedFilters: ClaimsRepositoryFilter = {
        startDate: new Date(startDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({
        startDate
      });

      expect(result.claims).toEqual(mockClaims);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });

    it("should filter claims by endDate", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: ""
        })
      ];

      const endDate = "2024-01-31";
      const expectedFilters: ClaimsRepositoryFilter = {
        endDate: new Date(endDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({
        endDate
      });

      expect(result.claims).toEqual(mockClaims);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });

    it("should filter claims by multiple filters", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 12500,
          diagnosisCodes: ""
        })
      ];

      const startDate = "2024-01-01";
      const endDate = "2024-01-31";
      const expectedFilters: ClaimsRepositoryFilter = {
        memberId: "MBR001",
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({
        memberId: "MBR001",
        startDate,
        endDate
      });

      expect(result.claims).toEqual(mockClaims);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty claims array", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({});

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle claims with minimum valid amounts", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 1,
          diagnosisCodes: ""
        }),
        new Claim({
          claimId: "CLM002",
          memberId: "MBR002",
          provider: "Dr. Smith Clinic",
          serviceDate: "2024-01-14",
          totalAmount: 1,
          diagnosisCodes: ""
        })
      ];

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({});

      expect(result.claims).toEqual(mockClaims);
      expect(result.totalAmount).toBe(2);
    });

    it("should handle claims with large amounts", async () => {
      const mockClaims = [
        new Claim({
          claimId: "CLM001",
          memberId: "MBR001",
          provider: "HealthCare Inc",
          serviceDate: "2024-01-15",
          totalAmount: 999999999,
          diagnosisCodes: ""
        }),
        new Claim({
          claimId: "CLM002",
          memberId: "MBR002",
          provider: "Dr. Smith Clinic",
          serviceDate: "2024-01-14",
          totalAmount: 1000000000,
          diagnosisCodes: ""
        })
      ];

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue(mockClaims);

      const result = await usecase.execute({});

      expect(result.claims).toEqual(mockClaims);
      expect(result.totalAmount).toBe(1999999999);
    });

    it("should handle empty string memberId by filtering it out", async () => {

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        memberId: ""
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle invalid date strings", async () => {
      const invalidDate = "invalid-date";
      const expectedFilters: ClaimsRepositoryFilter = {
        startDate: new Date(invalidDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        startDate: invalidDate
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });
  });

  describe("Repository Error Handling", () => {
    it("should handle repository errors", async () => {
      const repositoryError = new Error("Database connection failed");
      vi.mocked(mockRepository.findWithFilters).mockRejectedValue(repositoryError);

      await expect(usecase.execute({})).rejects.toThrow("Database connection failed");
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle repository timeout errors", async () => {
      const timeoutError = new Error("Query timeout");
      vi.mocked(mockRepository.findWithFilters).mockRejectedValue(timeoutError);

      await expect(usecase.execute({})).rejects.toThrow("Query timeout");
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle repository permission errors", async () => {
      const permissionError = new Error("Access denied");
      vi.mocked(mockRepository.findWithFilters).mockRejectedValue(permissionError);

      await expect(usecase.execute({})).rejects.toThrow("Access denied");
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });
  });

  describe("Input Validation", () => {
    it("should handle undefined memberId", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        memberId: undefined
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle null memberId", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        memberId: null as unknown as string
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle undefined startDate", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        startDate: undefined
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });

    it("should handle undefined endDate", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      const result = await usecase.execute({
        endDate: undefined
      });

      expect(result.claims).toEqual([]);
      expect(mockRepository.findWithFilters).toHaveBeenCalledWith({});
    });
  });

  describe("Repository Interaction", () => {
    it("should call repository with correct filters for memberId only", async () => {
      const expectedFilters: ClaimsRepositoryFilter = {
        memberId: "MBR001"
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({
        memberId: "MBR001"
      });

      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
      expect(mockRepository.findWithFilters).toHaveBeenCalledTimes(1);
    });

    it("should call repository with correct filters for date range only", async () => {
      const startDate = "2024-01-01";
      const endDate = "2024-01-31";
      const expectedFilters: ClaimsRepositoryFilter = {
        startDate: new Date(startDate),
        endDate: new Date(endDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({
        startDate,
        endDate
      });

      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });

    it("should not call save or findById methods", async () => {
      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({});

      expect(mockRepository.save).not.toHaveBeenCalled();
      expect(mockRepository.findById).not.toHaveBeenCalled();
    });

    it("should handle special characters in memberId", async () => {
      const specialMemberId = "MBR-001_Special@#$";
      const expectedFilters: ClaimsRepositoryFilter = {
        memberId: specialMemberId
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({
        memberId: specialMemberId
      });

      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });
  });

  describe("Date Handling", () => {
    it("should handle ISO date strings", async () => {
      const isoDate = "2024-01-15T10:30:00.000Z";
      const expectedFilters: ClaimsRepositoryFilter = {
        startDate: new Date(isoDate)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({
        startDate: isoDate
      });

      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });

    it("should handle date strings in different formats", async () => {
      const dateString = "01/15/2024";
      const expectedFilters: ClaimsRepositoryFilter = {
        endDate: new Date(dateString)
      };

      vi.mocked(mockRepository.findWithFilters).mockResolvedValue([]);

      await usecase.execute({
        endDate: dateString
      });

      expect(mockRepository.findWithFilters).toHaveBeenCalledWith(expectedFilters);
    });
  });
});
