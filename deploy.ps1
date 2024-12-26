$apiKey = "rnd_791l1FTIsnJz8PL5fAD6Gj65I4XX"
$headers = @{
    'Authorization' = "Bearer $apiKey"
    'Content-Type' = 'application/json'
}

# Generate a secure random string for JWT_SECRET
function New-SecureRandomString {
    $length = 32
    $bytes = New-Object Byte[] $length
    $rng = [System.Security.Cryptography.RNGCryptoServiceProvider]::new()
    $rng.GetBytes($bytes)
    return [Convert]::ToBase64String($bytes)
}

# First, try to get available regions
Write-Host "Getting available regions..."
try {
    $regions = Invoke-RestMethod -Uri 'https://api.render.com/v1/regions' -Method Get -Headers $headers
    $region = $regions | Where-Object { $_.slug -eq 'fra1' } | Select-Object -First 1
    if (-not $region) {
        $region = $regions | Select-Object -First 1
    }
    Write-Host "Using region: $($region.name) ($($region.slug))"
} catch {
    Write-Host "Error getting regions, using default 'fra1'"
    $region = @{ slug = 'fra1'; name = 'Frankfurt' }
}

# Create PostgreSQL database
Write-Host "`nCreating PostgreSQL database..."
$dbBody = @{
    name = "mr-platform-db"
    engine = "postgres"
    region = $region.slug
    instanceType = "basic"
    diskSize = 1
} | ConvertTo-Json

try {
    $database = Invoke-RestMethod -Uri 'https://api.render.com/v1/postgres' -Method Post -Headers $headers -Body $dbBody
    Write-Host "Database creation initiated. Database ID: $($database.id)"
    
    # Wait for database to be ready
    Write-Host "Waiting for database to be provisioned..."
    do {
        Start-Sleep -Seconds 10
        $dbStatus = Invoke-RestMethod -Uri "https://api.render.com/v1/postgres/$($database.id)" -Method Get -Headers $headers
        Write-Host "Database status: $($dbStatus.status)"
    } while ($dbStatus.status -eq "provisioning")

    if ($dbStatus.status -ne "active") {
        Write-Host "Database creation failed with status: $($dbStatus.status)"
        exit 1
    }

    $databaseUrl = $dbStatus.connectionString
    Write-Host "Database created successfully!"
} catch {
    Write-Host "Error creating database: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
    exit 1
}

# Generate secure JWT secret
$jwtSecret = New-SecureRandomString

# Create environment variables configuration
$envVars = @(
    # Core Configuration
    @{ key = "NODE_ENV"; value = "production" },
    @{ key = "PORT"; value = "10000" },
    @{ key = "DATABASE_URL"; value = $databaseUrl },

    # JWT Authentication
    @{ key = "JWT_SECRET"; value = $jwtSecret },
    @{ key = "JWT_EXPIRES_IN"; value = "1h" },
    @{ key = "JWT_REFRESH_EXPIRES_IN"; value = "7d" },

    # Logging
    @{ key = "LOG_LEVEL"; value = "info" },

    # Rate Limiting
    @{ key = "RATE_LIMIT_WINDOW_MS"; value = "900000" },
    @{ key = "RATE_LIMIT_MAX_REQUESTS"; value = "100" },

    # Security
    @{ key = "ENABLE_SECURITY_HEADERS"; value = "true" },

    # Development Tools (disabled in production)
    @{ key = "ENABLE_SWAGGER"; value = "false" },
    @{ key = "ENABLE_DEBUG_ENDPOINTS"; value = "false" },

    # TypeORM Configuration
    @{ key = "TYPEORM_LOGGING"; value = "false" },
    @{ key = "TYPEORM_SYNCHRONIZE"; value = "false" },
    @{ key = "TYPEORM_MIGRATIONS_RUN"; value = "true" }
)

# Create the web service
$serviceBody = @{
    name = "mr-platform"
    type = "web_service"
    env = "node"
    region = $region.slug
    repo = "https://github.com/ramy7777/MR-backend"
    branch = "main"
    rootDir = ""
    buildCommand = "npm ci && npm run build"
    startCommand = "npm start"
    envVars = $envVars
    plan = "starter"
    autoDeploy = $true
    runtime = "node"
    instanceType = "basic"
    numInstances = 1
} | ConvertTo-Json -Depth 10

Write-Host "`nCreating web service..."
try {
    $service = Invoke-RestMethod -Uri 'https://api.render.com/v1/services' -Method Post -Headers $headers -Body $serviceBody
    Write-Host "Service creation initiated. Service ID: $($service.id)"
    Write-Host "Service URL: $($service.serviceDetails.url)"
    
    # Save the secrets to a local file for backup
    @"
JWT_SECRET=$jwtSecret
DATABASE_URL=$databaseUrl
"@ | Out-File -FilePath "deployment_secrets.txt"
    Write-Host "Secrets have been saved to deployment_secrets.txt for backup"
    
    Write-Host "`nEnvironment Variables set:"
    $envVars | ForEach-Object {
        if ($_.key -in @("JWT_SECRET", "DATABASE_URL")) {
            Write-Host "$($_.key): [HIDDEN]"
        } else {
            Write-Host "$($_.key): $($_.value)"
        }
    }

    Write-Host "`nDeployment Status:"
    Write-Host "Database Status: $($dbStatus.status)"
    Write-Host "Database Region: $($region.name)"
    Write-Host "Service Status: Creating"
    Write-Host "Service Region: $($region.name)"
    
    Write-Host "`nNext steps:"
    Write-Host "1. Monitor your deployment at: https://dashboard.render.com"
    Write-Host "2. Check the deployment logs for any issues"
    Write-Host "3. Test your API endpoints once deployment is complete"
} catch {
    Write-Host "Error creating service: $_"
    Write-Host "Response: $($_.ErrorDetails.Message)"
    Write-Host "Status Code: $($_.Exception.Response.StatusCode.value__)"
    Write-Host "Status Description: $($_.Exception.Response.StatusDescription)"
    
    # Get more detailed error message
    if ($_.Exception.Response) {
        $rawResponse = $_.Exception.Response.GetResponseStream()
        $reader = New-Object System.IO.StreamReader($rawResponse)
        $rawResponse.Position = 0
        $responseBody = $reader.ReadToEnd()
        Write-Host "Detailed Response: $responseBody"
    }
    exit 1
}
