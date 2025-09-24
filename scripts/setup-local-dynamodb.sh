#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🏗️  LocalStack DynamoDB Setup${NC}"
echo -e "${BLUE}==============================${NC}"

# Check if LocalStack is running
echo -e "${YELLOW}🔍 Checking if LocalStack is running...${NC}"
if ! curl -s http://localhost:4566/_localstack/health >/dev/null 2>&1; then
    echo -e "${RED}❌ LocalStack is not running on localhost:4566${NC}"
    echo -e "${YELLOW}💡 Starting LocalStack with docker-compose...${NC}"

    if [ -f "docker-compose.yaml" ]; then
        docker-compose up localstack -d
        echo -e "${YELLOW}⏳ Waiting for LocalStack to start...${NC}"
        sleep 5

        # Check again
        if ! curl -s http://localhost:4566/_localstack/health >/dev/null 2>&1; then
            echo -e "${RED}❌ Failed to start LocalStack. Please check Docker setup.${NC}"
            exit 1
        fi
        echo -e "${GREEN}✅ LocalStack is now running!${NC}"
    else
        echo -e "${RED}❌ docker-compose.yaml not found. Please start LocalStack manually:${NC}"
        echo -e "${YELLOW}   docker run --rm -p 4566:4566 localstack/localstack${NC}"
        exit 1
    fi
else
    echo -e "${GREEN}✅ LocalStack is running!${NC}"
fi

# Run the TypeScript setup script
echo -e "${YELLOW}🚀 Creating DynamoDB table and GSIs...${NC}"
npm run setup:dynamodb:ts

if [ $? -eq 0 ]; then
    echo -e "${GREEN}🎉 Setup completed successfully!${NC}"
    echo -e "${BLUE}📋 Your Claims table is ready with 3 GSIs:${NC}"
    echo -e "   • GSI1: Query by Member ID + Date range"
    echo -e "   • GSI2: Query by exact Date"
    echo -e "   • GSI3: Query by Month bucket (optimized for ranges)"
    echo
    echo -e "${YELLOW}💡 Useful commands:${NC}"
    echo -e "   • List tables: aws dynamodb list-tables --endpoint-url=http://localhost:4566"
    echo -e "   • Describe table: aws dynamodb describe-table --table-name Claims --endpoint-url=http://localhost:4566"
    echo -e "   • Check health: curl http://localhost:4566/_localstack/health"
else
    echo -e "${RED}❌ Setup failed. Check the error messages above.${NC}"
    exit 1
fi
