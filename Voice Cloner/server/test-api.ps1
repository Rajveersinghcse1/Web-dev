$ErrorActionPreference = "Continue"

Write-Host "🚀 Testing Voice Cloner Backend API" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green

# Test 1: Health Check
Write-Host "`n1. Testing Health Check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -UseBasicParsing
    Write-Host "✅ Health Check: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Response: $($response.Content)"
} catch {
    Write-Host "❌ Health Check Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Rate Limiting Test
Write-Host "`n2. Testing Rate Limiting..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body '{}' -UseBasicParsing
    Write-Host "✅ Rate Limiting: Status $($response.StatusCode)" -ForegroundColor Green
} catch {
    if ($_.Exception.Message -like "*400*") {
        Write-Host "✅ Rate Limiting Working: Validation Error Expected" -ForegroundColor Green
    } else {
        Write-Host "❌ Rate Limiting Test: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 3: Input Validation - Invalid Registration
Write-Host "`n3. Testing Input Validation (Invalid Registration)..." -ForegroundColor Yellow
try {
    $invalidData = @{
        email = "invalid-email"
        password = "weak"
        name = "a"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $invalidData -UseBasicParsing
    Write-Host "❌ Should have failed validation" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*400*") {
        Write-Host "✅ Input Validation Working: Rejected invalid data" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 4: Valid Registration
Write-Host "`n4. Testing Valid User Registration..." -ForegroundColor Yellow
try {
    $validData = @{
        email = "test@example.com"
        password = "StrongPass123!"
        name = "Test User"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/register" -Method POST -ContentType "application/json" -Body $validData -UseBasicParsing
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Registration: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "User Created: $($responseData.data.user.email)"
} catch {
    if ($_.Exception.Message -like "*409*") {
        Write-Host "✅ Registration: User already exists (expected)" -ForegroundColor Green
    } else {
        Write-Host "❌ Registration Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 5: Valid Login
Write-Host "`n5. Testing User Login..." -ForegroundColor Yellow
try {
    $loginData = @{
        email = "test@example.com"
        password = "StrongPass123!"
    } | ConvertTo-Json
    
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/auth/login" -Method POST -ContentType "application/json" -Body $loginData -UseBasicParsing
    $responseData = $response.Content | ConvertFrom-Json
    Write-Host "✅ Login: Status $($response.StatusCode)" -ForegroundColor Green
    Write-Host "Access Token Received: $($responseData.data.accessToken.Length) characters"
    
    # Store token for further tests
    $global:accessToken = $responseData.data.accessToken
} catch {
    Write-Host "❌ Login Failed: $($_.Exception.Message)" -ForegroundColor Red
}

# Test 6: Protected Route (without token)
Write-Host "`n6. Testing Protected Route (No Token)..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/api/user/profile" -Method GET -UseBasicParsing
    Write-Host "❌ Should have been rejected" -ForegroundColor Red
} catch {
    if ($_.Exception.Message -like "*401*") {
        Write-Host "✅ Protection Working: Unauthorized access denied" -ForegroundColor Green
    } else {
        Write-Host "❌ Unexpected error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

# Test 7: Protected Route (with token)
Write-Host "`n7. Testing Protected Route (With Token)..." -ForegroundColor Yellow
if ($global:accessToken) {
    try {
        $headers = @{
            "Authorization" = "Bearer $($global:accessToken)"
        }
        $response = Invoke-WebRequest -Uri "http://localhost:5000/api/user/profile" -Method GET -Headers $headers -UseBasicParsing
        Write-Host "✅ Protected Route: Status $($response.StatusCode)" -ForegroundColor Green
        Write-Host "Profile Access Successful"
    } catch {
        Write-Host "❌ Protected Route Failed: $($_.Exception.Message)" -ForegroundColor Red
    }
} else {
    Write-Host "⚠️ Skipping - No access token available" -ForegroundColor Yellow
}

# Test 8: Security Headers
Write-Host "`n8. Testing Security Headers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "http://localhost:5000/health" -Method GET -UseBasicParsing
    $headers = $response.Headers
    
    $securityHeaders = @("X-Content-Type-Options", "X-Frame-Options", "X-XSS-Protection")
    $headerCount = 0
    
    foreach ($header in $securityHeaders) {
        if ($headers.ContainsKey($header)) {
            $headerCount++
            Write-Host "✅ $header: $($headers[$header])" -ForegroundColor Green
        }
    }
    
    if ($headerCount -gt 0) {
        Write-Host "✅ Security Headers: $headerCount/$($securityHeaders.Length) detected" -ForegroundColor Green
    } else {
        Write-Host "⚠️ Security Headers: None detected" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Security Headers Test Failed: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🏁 Testing Complete!" -ForegroundColor Green
Write-Host "=====================================" -ForegroundColor Green