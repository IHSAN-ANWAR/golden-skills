Continue = 'Stop'

# Admin login
 = @{ username = 'admin'; password = 'admin123' } | ConvertTo-Json
 = Invoke-RestMethod -Uri 'http://localhost:5000/api/auth/login' -Method Post -Body  -ContentType 'application/json'
Write-Host 'LOGIN RESPONSE:' ( | ConvertTo-Json -Depth 5)

 = .token
if (-not ) {
  Write-Host 'NO_TOKEN_FROM_LOGIN'
  exit 0
}

 = @{ Authorization = 'Bearer ' +  }

# Get approved submissions
 = Invoke-RestMethod -Uri 'http://localhost:5000/api/submissions?status=approved' -Headers  -Method Get
Write-Host 'APPROVED SUBMISSIONS COUNT:' .count

 = .submissions[0]
if (-not ) {
  Write-Host 'NO_APPROVED_SUBMISSIONS'
  exit 0
}

Write-Host 'USING SUBMISSION ID:' ._id

# Assign a custom test task
 = @{
  userPlanSubmissionId = ._id
  isCustomTask         = True
  customTaskTitle      = 'API Test Task'
  customTaskDescription = 'This task was created via API for testing approve / pending.'
  customTaskMessage    = 'Please complete this API test task.'
  taskPoints           = 25
  taskDeadline         = (Get-Date).AddDays(3)
}

 =  | ConvertTo-Json -Depth 5
 = @{
  Authorization = 'Bearer ' + 
  'Content-Type' = 'application/json'
}

 = Invoke-RestMethod -Uri 'http://localhost:5000/api/user-tasks/assign' -Method Post -Headers  -Body 
Write-Host 'ASSIGN RESPONSE:' ( | ConvertTo-Json -Depth 5)
