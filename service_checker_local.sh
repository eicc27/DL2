#!/bin/bash

# Define the ports and their categories
declare -A ports
ports=(
  ["7687"]="Neo4j (infrastructure)"
  ["3306"]="MySQL (infrastructure)"
  ["4200"]="Frontend (services)"
  ["8091"]="Vectorized Search (services)"
  ["8092"]="Knowledge Graph RAG (services)"
  ["8080"]="User Service (services)"
  ["8081"]="Graph Service (services)"
  ["27001"]="Crawler Exporter (utilities)"
)

# Function to check if a port is open
check_port() {
  local port=$1
  if lsof -i:$port > /dev/null 2>&1; then
    echo "✅ Port $port (${ports[$port]}) is open."
  else
    echo "❌ Port $port (${ports[$port]}) is unavailable."
  fi
}

# Main script logic
echo "Checking server ports..."
echo "=========================="
for port in "${!ports[@]}"; do
  check_port "$port"
done
echo "=========================="
echo "Port check completed."
