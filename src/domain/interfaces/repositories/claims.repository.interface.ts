import { Claim } from '../../entities/claim';

export interface ClaimsRepositoryFilter {
  memberId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface ClaimsRepositoryInterface {
  save(claim: Claim): Promise<void>;
  findById(claimId: string): Promise<Claim | null>;
  findWithFilters(filters: ClaimsRepositoryFilter): Promise<Claim[]>;
}
