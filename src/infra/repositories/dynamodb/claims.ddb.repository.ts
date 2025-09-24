import { ClaimsRepositoryFilter, ClaimsRepositoryInterface } from "@/domain/interfaces";
import { Claim } from "@/domain/entities";

import { ClientDDbRepository } from "./client.ddb.repository";
import { ClaimSchema } from "./schemas/claim.schema";
import { DateUtils } from "@/application/utils";

export class ClaimsDDbRepository implements ClaimsRepositoryInterface {
  private readonly tableName = String(process.env.CLAIMS_TABLE_NAME);

  constructor(
    private readonly client: ClientDDbRepository
  ) {}

  async save(claim: Claim): Promise<void> {
    const claimSchema = new ClaimSchema(claim.toJSON());

    await this.client.putItem(this.tableName, {
      ...claimSchema
    });
  }

  async findById(claimId: string): Promise<Claim | null> {
    const key = {
      PK: ClaimSchema.buildPK(claimId),
      SK: ClaimSchema.buildSK(claimId)
    };

    const item = await this.client.getItem(this.tableName, key);

    if (!item) {
      return null;
    }

    const claimSchema = new ClaimSchema({
      claimId: item.claimId,
      memberId: item.memberId,
      provider: item.provider,
      serviceDate: item.serviceDate,
      totalAmount: item.totalAmount,
      diagnosisCodes: item.diagnosisCodes
    });

    return claimSchema.toEntity();
  }

  async findWithFilters(filters: ClaimsRepositoryFilter): Promise<Claim[]> {
    let items: Record<string, any>[] = [];

    if (filters.memberId) {
      items = await this.queryByMemberId(filters);
    } else if (filters.startDate || filters.endDate) {
      items = await this.queryByMonthlyBuckets(filters);
    } else {
      const endDate = new Date();
      const startDate = new Date();
      startDate.setFullYear(endDate.getFullYear() - 1);
      items = await this.queryByMonthlyBuckets({ startDate, endDate });
    }

    const claims = items.map(item => {
      const claimSchema = new ClaimSchema({
        claimId: item.claimId,
        memberId: item.memberId,
        provider: item.provider,
        serviceDate: item.serviceDate,
        totalAmount: item.totalAmount,
        diagnosisCodes: item.diagnosisCodes
      });
      return claimSchema.toEntity();
    });

    return claims.sort((a, b) =>
      b.getServiceDate().getTime() - a.getServiceDate().getTime()
    );
  }

  private async queryByMemberId(filters: ClaimsRepositoryFilter): Promise<Record<string, any>[]> {
    const queryParams: any = {
      TableName: this.tableName,
      IndexName: 'GSI1',
      KeyConditionExpression: 'GSI1PK = :gsi1pk',
      ExpressionAttributeValues: {
        ':gsi1pk': ClaimSchema.buildGSI1PK(filters.memberId!)
      },
      ScanIndexForward: false
    };

    if (filters.startDate || filters.endDate) {
      if (filters.startDate && filters.endDate) {
        const startDateStr = DateUtils.formatToDateString(filters.startDate);
        const endDateStr = DateUtils.formatToDateString(filters.endDate);

        queryParams.KeyConditionExpression += ' AND GSI1SK BETWEEN :start AND :end';
        queryParams.ExpressionAttributeValues[':start'] = `DATE#${startDateStr}#`;
        queryParams.ExpressionAttributeValues[':end'] = `DATE#${endDateStr}#\uffff`;
      } else if (filters.startDate) {
        const startDateStr = DateUtils.formatToDateString(filters.startDate);
        queryParams.KeyConditionExpression += ' AND GSI1SK >= :start';
        queryParams.ExpressionAttributeValues[':start'] = `DATE#${startDateStr}#`;
      } else if (filters.endDate) {
        const endDateStr = DateUtils.formatToDateString(filters.endDate);
        queryParams.KeyConditionExpression += ' AND GSI1SK <= :end';
        queryParams.ExpressionAttributeValues[':end'] = `DATE#${endDateStr}#\uffff`;
      }
    }

    return await this.client.query(queryParams);
  }

  private async queryByMonthlyBuckets(filters: ClaimsRepositoryFilter): Promise<Record<string, any>[]> {
    const startDate = filters.startDate || new Date(new Date().getFullYear() - 1, 0, 1);
    const endDate = filters.endDate || new Date();

    const months = DateUtils.generateMonthRange(startDate, endDate);
    const allItems: Record<string, any>[] = [];

    const queryPromises = months.map(async (month) => {
      const queryParams: any = {
        TableName: this.tableName,
        IndexName: 'GSI3',
        KeyConditionExpression: 'GSI3PK = :gsi3pk',
        ExpressionAttributeValues: {
          ':gsi3pk': `MONTH#${month}`
        },
        ScanIndexForward: false
      };

      if (filters.startDate || filters.endDate) {
        const monthStartDate = filters.startDate && DateUtils.extractYearMonth(DateUtils.formatToDateString(filters.startDate)) === month
          ? DateUtils.formatToDateString(filters.startDate)
          : `${month}-01`;

        const monthEndDate = filters.endDate && DateUtils.extractYearMonth(DateUtils.formatToDateString(filters.endDate)) === month
          ? DateUtils.formatToDateString(filters.endDate)
          : `${month}-31`;

        queryParams.KeyConditionExpression += ' AND GSI3SK BETWEEN :start AND :end';
        queryParams.ExpressionAttributeValues[':start'] = `DATE#${monthStartDate}#`;
        queryParams.ExpressionAttributeValues[':end'] = `DATE#${monthEndDate}#\uffff`;
      }

      return await this.client.query(queryParams);
    });

    const results = await Promise.all(queryPromises);
    results.forEach(items => allItems.push(...items));

    return allItems;
  }
}