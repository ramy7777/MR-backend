$env:PGPASSWORD = "postgres"
$pgBin = "C:\Program Files\PostgreSQL\16\bin"

# Add PostgreSQL bin to PATH
$env:Path = "$pgBin;$env:Path"

# Check if PostgreSQL is running
$pgService = Get-Service -Name "postgresql*" -ErrorAction SilentlyContinue
if ($null -eq $pgService) {
    Write-Host "PostgreSQL service not found. Please make sure PostgreSQL is installed."
    exit 1
}

if ($pgService.Status -ne "Running") {
    Write-Host "Starting PostgreSQL service..."
    Start-Service $pgService
    Start-Sleep -Seconds 5
}

# Create database if it doesn't exist
$dbExists = & "$pgBin\psql" -U postgres -h localhost -p 5432 -t -c "SELECT 1 FROM pg_database WHERE datname = 'mr_platform'"
if ($null -eq $dbExists) {
    Write-Host "Creating database mr_platform..."
    & "$pgBin\psql" -U postgres -h localhost -p 5432 -c "CREATE DATABASE mr_platform"
    Write-Host "Database created successfully"
} else {
    Write-Host "Database mr_platform already exists"
}

Write-Host "Database setup complete"
