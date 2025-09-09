#!/bin/bash

# HR System - Supabase Setup Script
# This script helps you set up your Supabase database for the HR system

echo "🚀 HR System - Supabase Database Setup"
echo "======================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}This script will guide you through setting up your Supabase database.${NC}"
echo ""

# Check if supabase-setup.sql exists
if [ ! -f "supabase-setup.sql" ]; then
    echo -e "${RED}Error: supabase-setup.sql file not found!${NC}"
    echo "Please make sure you're running this script from the project root directory."
    exit 1
fi

echo -e "${YELLOW}📋 Setup Instructions:${NC}"
echo ""
echo "1. Go to your Supabase project dashboard"
echo "2. Navigate to the SQL Editor"
echo "3. Copy and paste the contents of 'supabase-setup.sql'"
echo "4. Execute the SQL commands"
echo ""
echo -e "${GREEN}📄 The supabase-setup.sql file contains:${NC}"
echo "   ✅ All required tables (employees, departments, documents, etc.)"
echo "   ✅ Performance reviews table"
echo "   ✅ Audit logs table"
echo "   ✅ Row Level Security (RLS) policies"
echo "   ✅ Storage bucket for documents"
echo "   ✅ Triggers and functions"
echo ""

# Ask if they want to open the file
echo -e "${BLUE}Would you like to open the SQL file now? (y/n)${NC}"
read -r response

if [[ "$response" =~ ^([yY][eE][sS]|[yY])$ ]]; then
    if command -v code &> /dev/null; then
        echo "Opening with VS Code..."
        code supabase-setup.sql
    elif command -v nano &> /dev/null; then
        echo "Opening with nano..."
        nano supabase-setup.sql
    elif command -v vim &> /dev/null; then
        echo "Opening with vim..."
        vim supabase-setup.sql
    else
        echo "Please open 'supabase-setup.sql' with your preferred text editor."
    fi
fi

echo ""
echo -e "${YELLOW}⚠️  Important Notes:${NC}"
echo ""
echo "• Make sure to update your .env.local file with your Supabase credentials:"
echo "  - NEXT_PUBLIC_SUPABASE_URL=your_supabase_url"
echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key"
echo ""
echo "• After running the SQL setup, test your authentication flow"
echo "• Create a test user to verify everything works correctly"
echo ""
echo -e "${GREEN}🎉 Once completed, your HR system will be ready to use!${NC}"
echo ""
echo "Need help? Check the README.md or contact support."
