# Healthcare Claims Ingestion API

A robust backend API for ingesting, validating, and managing healthcare claims data from CSV files. Built with Clean Architecture principles to ensure maintainability, testability, and technology independence.

## 🏗️ Architecture Overview

This project follows **Clean Architecture** principles, providing clear separation of concerns and dependency inversion. The architecture is organized into distinct layers:

```
┌──────────────────────────────────────────────────────────────────┐
│                        Application Layer                         │
│  Controllers • Routes • Middleware • Factories • Schemas • Utils │
├──────────────────────────────────────────────────────────────────┤
│                           Domain Layer                           │
│           Entities • Use Cases • Interfaces • Errors             │
├──────────────────────────────────────────────────────────────────┤
│                       Infrastructure Layer                       │
│          Repositories • Services • External Dependencies         │
└──────────────────────────────────────────────────────────────────┘
```

### Why Clean Architecture?

- **Testability**: Business logic is isolated and easily testable
- **Technology Independence**: Core business rules don't depend on external frameworks
- **Flexibility**: Easy to swap implementations (e.g., in-memory to database)
- **Maintainability**: Clear boundaries and single responsibility principle
- **Extensibility**: New features can be added without affecting existing code

## 🚀 Features

### Core Functionality

- **CSV File Ingestion**: Upload and parse CSV files containing claims data
- **Data Validation**: Comprehensive validation of claim data with detailed error reporting
- **Claims Retrieval**: Query claims with filtering by member ID and date ranges
- **Single Claim Lookup**: Retrieve individual claims by ID
- **Error Handling**: Detailed error reporting with row-level validation feedback

### Business Rules

- **Required Fields**: `claimId`, `memberId`, `provider`, `serviceDate`, `totalAmount`
- **Date Validation**: Service dates cannot be in the future
- **Amount Validation**: Total amounts must be positive integers (stored in cents)
- **Diagnosis Codes**: Optional semicolon-delimited strings (e.g., "R12;M54.5")
- **Duplicate Prevention**: Rejects duplicate claim IDs

## 🛠️ Technology Stack

- **Runtime**: Node.js with TypeScript
- **Framework**: Express.js
- **Validation**: Zod for schema validation
- **File Processing**: Multer for file uploads, fast-csv for CSV parsing
- **Testing**: Vitest for unit testing
- **Development**: Nodemon for hot reloading
- **Code Quality**: ESLint, Prettier, Husky for git hooks
- **Persistence**: DynamoDB (primary) and In-memory for development
- **Containerization**: Docker for easy setup

## 📋 API Endpoints

### Health Check
```
GET /health
```
Returns API status and timestamp.

### Ingest Claims
```
POST /claims
Content-Type: multipart/form-data
Body: file (CSV file)
```

**Response:**
```json
{
  "successCount": 45,
  "errorCount": 5,
  "errors": [
    { "row": 3, "message": "Missing memberId" },
    { "row": 9, "message": "Invalid totalAmount (not a positive integer)" }
  ]
}
```

### Get Claims (with filtering)
```
GET /claims?memberId=MBR001&startDate=2025-01-01&endDate=2025-01-31
```

**Response:**
```json
{
  "claims": [
    {
      "claimId": "CLM001",
      "memberId": "MBR001",
      "provider": "HealthCare Inc",
      "serviceDate": "2025-01-15",
      "totalAmount": 12500,
      "diagnosisCodes": "R51;K21.9"
    }
  ],
  "totalAmount": 12500
}
```

### Get Single Claim
```
GET /claims/:id
```

**Response:**
```json
{
  "claimId": "CLM001",
  "memberId": "MBR001",
  "provider": "HealthCare Inc",
  "serviceDate": "2025-01-15",
  "totalAmount": 12500,
  "diagnosisCodes": "R51;K21.9"
}
```

## 📊 CSV Format

The API expects CSV files with the following structure:

```csv
claimId,memberId,provider,serviceDate,totalAmount,diagnosisCodes
CLM001,MBR001,HealthCare Inc,2025-01-15,12500,R51;K21.9
CLM002,MBR002,Dr. Smith Clinic,2025-01-14,8999,R10.9
CLM003,MBR001,City Hospital,2025-01-13,30000,M54.5
```

### Field Specifications

- **claimId**: Required, unique identifier
- **memberId**: Required, member identifier
- **provider**: Required, healthcare provider name
- **serviceDate**: Required, date in YYYY-MM-DD format, cannot be future
- **totalAmount**: Required, positive integer in cents (e.g., 12500 = $125.00)
- **diagnosisCodes**: Optional, semicolon-delimited codes

## 🚀 Getting Started

You can run the application in two ways: **local development** (Node.js + LocalStack) or **fully containerized with Docker**. Choose the option that best fits your environment.

---

## 🖥️ **Option 1: Local Development (Node.js + LocalStack)**

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Docker (for LocalStack DynamoDB)

### Installation & Setup

1. **Extract and install dependencies:**
```bash
# Extract the ZIP file to your desired location
cd healthcare-claims-ingestion
npm install
```

2. **Configure environment and local database:**
```bash
npm run setup
```

This command will:
- ✅ Copy environment variables (`env.example` → `.env`)
- ✅ Start LocalStack via Docker Compose
- ✅ Create DynamoDB table with 3 optimized GSIs

3. **Build the project:**
```bash
npm run build
```

### Running Locally

1. **Ensure LocalStack is running:**
```bash
docker-compose up localstack -d
```

2. **Start the development server:**
```bash
npm run dev
```

3. **Access the API:**
   - API: `http://localhost:3000`
   - Health check: `http://localhost:3000/health`

### Useful Commands (Local)

```bash
# Check LocalStack
curl http://localhost:4566/_localstack/health

# List DynamoDB tables
aws dynamodb list-tables --endpoint-url=http://localhost:4566

# Recreate table only (if needed)
npm run setup:dynamodb

# LocalStack logs
docker-compose logs localstack
```

---

## 🐳 **Option 2: Docker Development (Full Containerized)**

### Prerequisites

- Docker
- Docker Compose

### Setup & Running

1. **Extract and setup:**
```bash
# Extract the ZIP file to your desired location
cd healthcare-claims-ingestion
npm install
```

2. **Configure environment variables:**
```bash
cp env.example .env
```

3. **Build and run everything with Docker:**
```bash
# Start all services
docker-compose up --build

# Or in background
docker-compose up --build -d
```

4. **Configure DynamoDB table:**
```bash
# Run setup inside container or locally
npm run setup:dynamodb
```

5. **Access the application:**
   - API: `http://localhost:3000`
   - Health check: `http://localhost:3000/health`

### Useful Commands (Docker)

```bash
# View application logs
docker-compose logs app

# View LocalStack logs
docker-compose logs localstack

# Rebuild app only
docker-compose up --build app

# Stop all services
docker-compose down

# Clean volumes (full reset)
docker-compose down -v
```

### Docker Troubleshooting

```bash
# Check container status
docker-compose ps

# Check LocalStack health
docker-compose exec localstack curl http://localhost:4566/_localstack/health

# Access application shell
docker-compose exec app sh

# View specific logs
docker-compose logs --tail=50 app
```

---

## 🧪 Testing

The project includes comprehensive unit tests covering:

- **Domain Entities**: Claim validation and business rules
- **Use Cases**: Business logic and orchestration
- **Infrastructure**: Repository and service implementations
- **Controllers**: HTTP request handling

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch
```

---

## 🎯 **Endpoint Configuration**

### Local Development (Option 1)
- **App → LocalStack**: `http://localhost:4566`
- **Scripts → LocalStack**: `http://localhost:4566`

### Docker (Option 2)
- **App → LocalStack**: `http://localstack:4566` (internal communication)
- **Scripts → LocalStack**: `http://localhost:4566` (from host)

---

### LocalStack DynamoDB

The application uses LocalStack to simulate AWS DynamoDB locally. The table structure includes:

**Table: Claims**
- **Primary Key**: `PK` (Hash), `SK` (Range)
- **GSI1**: Query by Member ID + Date filtering
  - `GSI1PK`: `MEMBER#{memberId}`
  - `GSI1SK`: `DATE#{serviceDate}#CLAIM#{claimId}`
- **GSI2**: Query by exact Date (legacy compatibility)
  - `GSI2PK`: `DATE#{serviceDate}`
  - `GSI2SK`: `DATE#{serviceDate}#CLAIM#{claimId}`
- **GSI3**: **Monthly Bucketed Queries** (primary for date ranges)
  - `GSI3PK`: `MONTH#{YYYY-MM}`
  - `GSI3SK`: `DATE#{serviceDate}#CLAIM#{claimId}`

#### Query Optimization

The GSI3 monthly bucketing strategy ensures:
- **Predictable costs** (no expensive scans)
- **100% Query operations** (never uses Scan)
- **Parallel execution** (1-3 queries for typical date ranges)
- **Efficient filtering** (BETWEEN operations on sort keys)

#### Useful DynamoDB Commands

```bash
# List tables
aws dynamodb list-tables --endpoint-url=http://localhost:4566

# Describe the Claims table
aws dynamodb describe-table --table-name Claims --endpoint-url=http://localhost:4566

# Check LocalStack health
curl http://localhost:4566/_localstack/health
```

## 🔧 Configuration

### Environment Variables

#### Server Configuration
- `PORT`: Server port (default: 3000)
- `NODE_ENV`: Environment mode (development/production)

#### DynamoDB Configuration
- `CLAIMS_TABLE_NAME`: DynamoDB table name (default: Claims)
- `DYNAMODB_ENDPOINT`: DynamoDB endpoint URL
  - Local development: `http://localhost:4566`
  - Docker containers: `http://localstack:4566`
  - AWS production: `https://dynamodb.region.amazonaws.com`
- `AWS_REGION`: AWS region (default: us-east-1)
- `AWS_ACCESS_KEY_ID`: AWS access key (default: test for LocalStack)
- `AWS_SECRET_ACCESS_KEY`: AWS secret key (default: test for LocalStack)

#### File Upload Limits
- Maximum file size: 10MB
- Allowed file types: CSV files only
- Maximum files per request: 1

## 📝 Data Persistence

The application supports multiple repository implementations:

### DynamoDB Repository (Primary)
- **Production-ready** DynamoDB implementation with optimized GSIs
- **Monthly bucketing strategy** for efficient date range queries
- **Cost-optimized** with 100% Query operations (no Scans)
- Supports both local development (LocalStack) and AWS production

### In-Memory Repository (Development/Testing)
- **Fast development** with JSON file persistence
- **Data persistence** across restarts via `data/claims.json`
- **Easy testing** without external dependencies

### Repository Architecture Benefits

The Clean Architecture design allows seamless switching between repositories:

1. Both implement the same `ClaimsRepositoryInterface`
2. Business logic remains unchanged regardless of persistence layer
3. Easy to add new repository implementations (PostgreSQL, MongoDB, etc.)
4. Factory pattern handles dependency injection automatically

## 🏛️ Architecture Benefits

### Dependency Inversion
- Domain layer doesn't depend on infrastructure
- Easy to swap implementations without changing business logic

### Single Responsibility
- Each class has one reason to change
- Clear separation of concerns

### Open/Closed Principle
- Open for extension, closed for modification
- New features can be added without changing existing code

### Testability
- Business logic is isolated and easily testable
- Dependencies can be mocked for unit testing

## 🚧 Future Improvements

With additional time, the following enhancements would further strengthen the application:

### Testing Enhancements
- **Integration Tests**: Add end-to-end tests that verify the complete request-response cycle, including file uploads, database interactions, and API responses
- **DynamoDB Repository Tests**: Implement comprehensive unit tests for the DynamoDB repository implementation, including GSI queries and error scenarios
- **Application Layer Tests**: Expand controller tests with more edge cases, middleware testing for file upload validation, and factory pattern testing

### Error Handling Improvements
- **Infrastructure Layer**: Enhance error handling in repositories and services with more specific error types and better error propagation

### Additional Features
- **File Storage**: Implement file persistence by saving uploaded CSV files to cloud storage (AWS S3, Google Cloud Storage) for audit trails, reprocessing capabilities, and compliance requirements
- **API Documentation**: Generate OpenAPI/Swagger documentation for better API discoverability

## 👨‍💻 Author

**Thiago Andrade Silva**

---