import { Claim } from '../../entities/claim';

export interface GetClaimsResponse {
  claims: Claim[];
  totalAmount?: number;
}
