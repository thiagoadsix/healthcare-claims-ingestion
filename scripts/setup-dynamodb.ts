import { DynamoDBClient, CreateTableCommand, DescribeTableCommand } from '@aws-sdk/client-dynamodb';

import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../.env') });

/**
 * Script to create DynamoDB table with GSIs for local development using LocalStack
 */

const client = new DynamoDBClient({
  region: String(process.env.AWS_REGION),
  endpoint: String(process.env.DYNAMODB_ENDPOINT),
  credentials: {
    accessKeyId: String(process.env.AWS_ACCESS_KEY_ID),
    secretAccessKey: String(process.env.AWS_SECRET_ACCESS_KEY)
  }
});

const TABLE_NAME = 'Claims';

const createTableParams = {
  TableName: TABLE_NAME,
  BillingMode: 'PAY_PER_REQUEST' as const,

  // Primary Key
  KeySchema: [
    { AttributeName: 'PK', KeyType: 'HASH' as const },
    { AttributeName: 'SK', KeyType: 'RANGE' as const }
  ],

  // Attribute Definitions
  AttributeDefinitions: [
    { AttributeName: 'PK', AttributeType: 'S' as const },
    { AttributeName: 'SK', AttributeType: 'S' as const },
    { AttributeName: 'GSI1PK', AttributeType: 'S' as const },
    { AttributeName: 'GSI1SK', AttributeType: 'S' as const },
    { AttributeName: 'GSI2PK', AttributeType: 'S' as const },
    { AttributeName: 'GSI2SK', AttributeType: 'S' as const },
    { AttributeName: 'GSI3PK', AttributeType: 'S' as const },
    { AttributeName: 'GSI3SK', AttributeType: 'S' as const }
  ],

  // Global Secondary Indexes
  GlobalSecondaryIndexes: [
    {
      // GSI1: Query by Member ID with date filtering
      IndexName: 'GSI1',
      KeySchema: [
        { AttributeName: 'GSI1PK', KeyType: 'HASH' as const }, // MEMBER#{memberId}
        { AttributeName: 'GSI1SK', KeyType: 'RANGE' as const } // DATE#{serviceDate}#CLAIM#{claimId}
      ],
      Projection: { ProjectionType: 'ALL' as const }
    },
    {
      // GSI2: Query by exact date (legacy - kept for compatibility)
      IndexName: 'GSI2',
      KeySchema: [
        { AttributeName: 'GSI2PK', KeyType: 'HASH' as const }, // DATE#{serviceDate}
        { AttributeName: 'GSI2SK', KeyType: 'RANGE' as const } // DATE#{serviceDate}#CLAIM#{claimId}
      ],
      Projection: { ProjectionType: 'ALL' as const }
    },
    {
      // GSI3: Query by month bucket (primary for date ranges)
      IndexName: 'GSI3',
      KeySchema: [
        { AttributeName: 'GSI3PK', KeyType: 'HASH' as const }, // MONTH#{YYYY-MM}
        { AttributeName: 'GSI3SK', KeyType: 'RANGE' as const } // DATE#{serviceDate}#CLAIM#{claimId}
      ],
      Projection: { ProjectionType: 'ALL' as const }
    }
  ]
};

async function tableExists(): Promise<boolean> {
  try {
    await client.send(new DescribeTableCommand({ TableName: TABLE_NAME }));
    return true;
  } catch (error: any) {
    if (error.name === 'ResourceNotFoundException') {
      return false;
    }
    throw error;
  }
}

async function createTable(): Promise<void> {
  try {
    console.log('🔍 Checking if table already exists...');

    if (await tableExists()) {
      console.log(`✅ Table '${TABLE_NAME}' already exists in LocalStack`);
      return;
    }

    console.log(`🚀 Creating table '${TABLE_NAME}' with 3 GSIs...`);

    const result = await client.send(new CreateTableCommand(createTableParams));

    if (result.TableDescription) {
      console.log(`✅ Table '${TABLE_NAME}' created successfully!`);
      console.log(`📊 Status: ${result.TableDescription.TableStatus}`);

      console.log('\n📋 Table Structure:');
      console.log(`   Primary Key: PK (Hash), SK (Range)`);
      console.log(`   📈 GSI1: GSI1PK (MEMBER#{memberId}) / GSI1SK (DATE#{serviceDate}#CLAIM#{claimId})`);
      console.log(`   📅 GSI2: GSI2PK (DATE#{serviceDate}) / GSI2SK (DATE#{serviceDate}#CLAIM#{claimId})`);
      console.log(`   🗓️  GSI3: GSI3PK (MONTH#{YYYY-MM}) / GSI3SK (DATE#{serviceDate}#CLAIM#{claimId})`);

      console.log('\n🎯 Query Patterns:');
      console.log(`   • Get claim by ID: PK = "CLAIM#{claimId}"`);
      console.log(`   • Claims by member: GSI1PK = "MEMBER#{memberId}"`);
      console.log(`   • Claims by date: GSI2PK = "DATE#{serviceDate}"`);
      console.log(`   • Claims by month: GSI3PK = "MONTH#{YYYY-MM}"`);
      console.log(`   • Date range queries: Multiple GSI3 queries (1-3 typical)`);
    }

  } catch (error: any) {
    console.log(process.env)
    console.error('❌ Error creating table:', error.message);

    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 Make sure LocalStack is running:');
      console.error('   docker-compose up localstack -d');
      console.error('   or');
      console.error('   docker run --rm -p 4566:4566 localstack/localstack');
    }

    process.exit(1);
  }
}

async function main() {
  console.log('🏗️  DynamoDB LocalStack Setup');
  console.log('=============================');
  console.log(`📍 Endpoint: http://localhost:4566`);
  console.log(`🗄️  Table: ${TABLE_NAME}\n`);

  await createTable();

  console.log('\n🎉 Setup complete! Your DynamoDB table is ready for development.');
  console.log('\n💡 To verify the table was created:');
  console.log('   aws dynamodb list-tables --endpoint-url=http://localhost:4566');
}

// Execute the setup
main().catch(console.error);
