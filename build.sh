#!/bin/bash

# Colors for logging
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function for logging
log() {
    local color=$1
    local name=$2
    local message=$3
    echo -e "${color}[${name}]${NC} ${message}"
}

# Remove the build directory if it exists
rm -rf build
log $RED "REMOVE" "Removed build directory"

rm -f build.zip
log $RED "REMOVE" "Removed build.zip"

# Compile the TypeScript project using tsc and specify the path to tsconfig.json
tsc -p tsconfig.json
log $GREEN "COMPILE" "Compiled TypeScript project"

# Copy package.json and app.json to the build directory
cp package.json build/package.json
cp app.json build/app.json
log $GREEN "COPY" "Copied package.json and app.json to build directory"

# Copy the src/sql directory to build/src/sql
cp -r src/sql build/src/sql
log $GREEN "COPY" "Copied src/sql to build/src/sql"

# Copy the contents of vm/bin directory to build/vm/bin
cp -r vm/bin/* build/vm/bin
log $GREEN "COPY" "Copied contents of vm/bin to build/vm/bin"

# Change directory to build/src
cd build/src || exit
log $BLUE "CHANGE DIR" "Changed directory to build/src"
