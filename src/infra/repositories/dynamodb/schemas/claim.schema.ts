import { Claim } from "@/domain/entities/claim";
import { unmarshall } from "@aws-sdk/util-dynamodb";

export type ClaimSchemaProperties = {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: number;
  diagnosisCodes: string;
}

export class ClaimSchema implements ClaimSchemaProperties {
  claimId: string;
  memberId: string;
  provider: string;
  serviceDate: string;
  totalAmount: number;
  diagnosisCodes: string;

  /** CLAIM#{claimId} */
  readonly PK: string;
  /** CLAIM#{claimId} */
  readonly SK: string;

  /** MEMBER#{memberId} */
  readonly GSI1PK: string;
  /** DATE#{serviceDate}#CLAIM#{claimId} */
  readonly GSI1SK: string;

  /** DATE#{serviceDate} */
  readonly GSI2PK: string;
  /** DATE#{serviceDate}#CLAIM#{claimId} */
  readonly GSI2SK: string;

  /** MONTH#{YYYY-MM} */
  readonly GSI3PK: string;
  /** DATE#{serviceDate}#CLAIM#{claimId} */
  readonly GSI3SK: string;

  constructor(properties: ClaimSchemaProperties) {
    this.claimId = properties.claimId;
    this.memberId = properties.memberId;
    this.provider = properties.provider;
    this.serviceDate = properties.serviceDate;
    this.totalAmount = properties.totalAmount;
    this.diagnosisCodes = properties.diagnosisCodes;

    this.PK = ClaimSchema.buildPK(this.claimId);
    this.SK = ClaimSchema.buildSK(this.claimId);
    this.GSI1PK = ClaimSchema.buildGSI1PK(this.memberId);
    this.GSI1SK = ClaimSchema.buildGSI1SK(this.serviceDate, this.claimId);
    this.GSI2PK = ClaimSchema.buildGSI2PK(this.serviceDate);
    this.GSI2SK = ClaimSchema.buildGSI2SK(this.serviceDate, this.claimId);
    this.GSI3PK = ClaimSchema.buildGSI3PK(this.serviceDate);
    this.GSI3SK = ClaimSchema.buildGSI3SK(this.serviceDate, this.claimId);
  }

  toEntity(): Claim {
    return new Claim(this);
  }

  fromEntity(entity: Claim): ClaimSchema {
    return new ClaimSchema(entity.toJSON());
  }

  fromUnmarshalledItem(item: Record<string, any>): ClaimSchema {
    const unmarshalledItem = unmarshall(item) as ClaimSchemaProperties;
    return new ClaimSchema(unmarshalledItem);
  }

  keys(): Record<string, string> {
    return {
      PK: this.PK,
      SK: this.SK,
      GSI1PK: this.GSI1PK,
      GSI1SK: this.GSI1SK,
      GSI2PK: this.GSI2PK,
      GSI2SK: this.GSI2SK,
      GSI3PK: this.GSI3PK,
      GSI3SK: this.GSI3SK
    };
  }

  static buildPK(claimId: string): string {
    return `CLAIM#${claimId}`;
  }

  static buildSK(claimId: string): string {
    return `CLAIM#${claimId}`;
  }

  static buildGSI1PK(memberId: string): string {
    return `MEMBER#${memberId}`;
  }

  static buildGSI1SK(serviceDate: string, claimId: string): string {
    return `DATE#${serviceDate}#CLAIM#${claimId}`;
  }

  static buildGSI2PK(serviceDate: string): string {
    return `DATE#${serviceDate}`;
  }

  static buildGSI2SK(serviceDate: string, claimId: string): string {
    return `DATE#${serviceDate}#CLAIM#${claimId}`;
  }

  static buildGSI3PK(serviceDate: string): string {
    const yearMonth = serviceDate.substring(0, 7); // Extract YYYY-MM from YYYY-MM-DD
    return `MONTH#${yearMonth}`;
  }

  static buildGSI3SK(serviceDate: string, claimId: string): string {
    return `DATE#${serviceDate}#CLAIM#${claimId}`;
  }
}