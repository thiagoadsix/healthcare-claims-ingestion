import { DateUtils } from "@/application/utils";

export type ClaimCTO = {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: number;
  diagnosisCodes: string;
}

export interface ClaimValidationResult {
  isValid: boolean;
  errors: string[];
}

export class Claim {
  private readonly claimId: string;
  private readonly memberId: string;
  private readonly provider: string;
  private readonly serviceDate: Date;
  private readonly totalAmount: number;
  private readonly diagnosisCodes: string[];

  constructor(cto: ClaimCTO) {
    this.claimId = cto.claimId;
    this.memberId = cto.memberId;
    this.provider = cto.provider;
    this.serviceDate = new Date(cto.serviceDate);
    this.totalAmount = cto.totalAmount;
    this.diagnosisCodes = this.parseDiagnosisCodes(cto.diagnosisCodes);

    this.validate(cto);
  }

  static validate(cto: ClaimCTO): ClaimValidationResult {
    const errors: string[] = [];

    if (!cto.claimId.trim()) {
      errors.push('Missing claimId');
    }
    if (!cto.memberId.trim()) {
      errors.push('Missing memberId');
    }
    if (!cto.provider.trim()) {
      errors.push('Missing provider');
    }
    if (!cto.serviceDate.trim()) {
      errors.push('Missing serviceDate');
    }

    if (cto.serviceDate.trim()) {
      const serviceDate = new Date(cto.serviceDate);
      if (isNaN(serviceDate.getTime())) {
        errors.push('Invalid serviceDate format');
      } else if (serviceDate > new Date()) {
        errors.push('Service date cannot be in the future');
      }
    }

    if (typeof cto.totalAmount !== 'number' || cto.totalAmount <= 0) {
      errors.push('Invalid totalAmount (must be a positive integer)');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  }

  private validate(cto: ClaimCTO): void {
    const validation = Claim.validate(cto);
    if (!validation.isValid) {
      throw new Error(validation.errors.join(', '));
    }
  }

  private parseDiagnosisCodes(diagnosisCodesStr: string): string[] {
    if (!diagnosisCodesStr?.trim()) {
      return [];
    }

    return diagnosisCodesStr
      .split(';')
      .map(code => code.trim())
      .filter(code => code.length > 0);
  }

  public getClaimId(): string {
    return this.claimId;
  }

  public getMemberId(): string {
    return this.memberId;
  }

  public getProvider(): string {
    return this.provider;
  }

  public getServiceDate(): Date {
    return this.serviceDate;
  }

  public getTotalAmount(): number {
    return this.totalAmount;
  }

  public getDiagnosisCodes(): string[] {
    return [...this.diagnosisCodes];
  }

  public toJSON() {
    return {
      claimId: this.claimId,
      memberId: this.memberId,
      provider: this.provider,
      serviceDate: DateUtils.formatToDateString(this.serviceDate),
      totalAmount: this.totalAmount,
      diagnosisCodes: this.diagnosisCodes.join(';')
    };
  }
}