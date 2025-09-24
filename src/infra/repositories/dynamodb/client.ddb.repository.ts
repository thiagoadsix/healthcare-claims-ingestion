import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import {
  DynamoDBDocumentClient,
  GetCommand,
  PutCommand,
  QueryCommand,
  ScanCommand,
  DeleteCommand,
  UpdateCommand
} from "@aws-sdk/lib-dynamodb";

export class ClientDDbRepository {
  private readonly documentClient: DynamoDBDocumentClient;

  constructor() {
    this.documentClient = DynamoDBDocumentClient.from(new DynamoDBClient({
      endpoint: String(process.env.DYNAMODB_ENDPOINT),
      region: String(process.env.AWS_REGION),
      credentials: {
        accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
        secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY)
      }
    }));
  }

  get client(): DynamoDBDocumentClient {
    return this.documentClient;
  }

  async getItem(tableName: string, key: Record<string, any>): Promise<Record<string, any> | undefined> {
    const command = new GetCommand({
      TableName: tableName,
      Key: key
    });

    const result = await this.documentClient.send(command);
    return result.Item;
  }

  async putItem(tableName: string, item: Record<string, any>): Promise<void> {
    const command = new PutCommand({
      TableName: tableName,
      Item: item
    });

    await this.documentClient.send(command);
  }

  async query(params: {
    TableName: string;
    IndexName?: string;
    KeyConditionExpression: string;
    ExpressionAttributeValues: Record<string, any>;
    ExpressionAttributeNames?: Record<string, string>;
    FilterExpression?: string;
    ScanIndexForward?: boolean;
    Limit?: number;
  }): Promise<Record<string, any>[]> {
    const command = new QueryCommand(params);
    const result = await this.documentClient.send(command);
    return result.Items || [];
  }

  async scan(params: {
    TableName: string;
    FilterExpression?: string;
    ExpressionAttributeValues?: Record<string, any>;
    ExpressionAttributeNames?: Record<string, string>;
    Limit?: number;
  }): Promise<Record<string, any>[]> {
    const command = new ScanCommand(params);
    const result = await this.documentClient.send(command);
    return result.Items || [];
  }

  async deleteItem(tableName: string, key: Record<string, any>): Promise<void> {
    const command = new DeleteCommand({
      TableName: tableName,
      Key: key
    });

    await this.documentClient.send(command);
  }

  async updateItem(params: {
    TableName: string;
    Key: Record<string, any>;
    UpdateExpression: string;
    ExpressionAttributeValues: Record<string, any>;
    ExpressionAttributeNames?: Record<string, string>;
  }): Promise<Record<string, any> | undefined> {
    const command = new UpdateCommand(params);
    const result = await this.documentClient.send(command);
    return result.Attributes;
  }
}