import * as fs from 'fs/promises';
import * as path from 'path';

import { Claim } from "@/domain/entities";
import { ClaimsRepositoryInterface, ClaimsRepositoryFilter } from "@/domain/interfaces/repositories";

export class ClaimsInMemoryRepository implements ClaimsRepositoryInterface {
  private claims: Map<string, Claim> = new Map();
  private readonly dataFilePath: string;
  private loadPromise: Promise<void>;

  constructor(dataFilePath?: string) {
    this.dataFilePath = dataFilePath || path.join(process.cwd(), 'data', 'claims.json');
    this.loadPromise = this.loadData();
  }

  async save(claim: Claim): Promise<void> {
    await this.waitForLoad();

    const claimId = claim.getClaimId();
    this.claims.set(claimId, claim);

    await this.saveData();
  }

  async findById(claimId: string): Promise<Claim | null> {
    await this.waitForLoad();
    return this.claims.get(claimId) || null;
  }

  async findWithFilters(filters: ClaimsRepositoryFilter): Promise<Claim[]> {
    await this.waitForLoad();
    const allClaims = Array.from(this.claims.values());

    let filteredClaims = allClaims;

    if (filters.memberId) {
      filteredClaims = filteredClaims.filter(claim =>
        claim.getMemberId() === filters.memberId
      );
    }

    if (filters.startDate || filters.endDate) {
      filteredClaims = filteredClaims.filter(claim => {
        const serviceDate = claim.getServiceDate();

        if (filters.startDate && serviceDate < filters.startDate) {
          return false;
        }

        if (filters.endDate && serviceDate > filters.endDate) {
          return false;
        }

        return true;
      });
    }

    return filteredClaims.sort((a, b) =>
      b.getServiceDate().getTime() - a.getServiceDate().getTime()
    );
  }

  private async saveData(): Promise<void> {
    try {
      const claimsData = Array.from(this.claims.values()).map(c => c.toJSON());

      await fs.writeFile(this.dataFilePath, JSON.stringify(claimsData, null, 2), 'utf-8');
    } catch (error) {
      console.error('Error saving claims data:', error);
      throw new Error('Failed to persist claims data');
    }
  }

  private async waitForLoad(): Promise<void> {
    await this.loadPromise;
  }

  private async loadData(): Promise<void> {
    const dataDir = path.dirname(this.dataFilePath);
    await fs.mkdir(dataDir, { recursive: true });

    try {
      await fs.access(this.dataFilePath);
    } catch {
      await fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }

    try {
      const fileContent = await fs.readFile(this.dataFilePath, 'utf-8');
      const claimsData = JSON.parse(fileContent);

      for (const claimData of claimsData) {
        const claim = new Claim(claimData);
        this.claims.set(claim.getClaimId(), claim);
      }
    } catch (error) {
      console.error('Error loading claims data:', error);
      this.claims = new Map();
      await fs.writeFile(this.dataFilePath, JSON.stringify([], null, 2), 'utf-8');
    }
  }
}