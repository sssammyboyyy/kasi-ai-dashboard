# Deploy Supabase Edge Functions
# Usage: ./scripts/deploy_edge_functions.ps1

$PROJECT_REF = "rfacczttfdbrqpyguopy"

Write-Host "Deploying 'process-lead' function..."
npx supabase functions deploy process-lead --no-verify-jwt --project-ref $PROJECT_REF

Write-Host "Deploying 'send-whatsapp' function..."
npx supabase functions deploy send-whatsapp --project-ref $PROJECT_REF

Write-Host "Deployment Complete."
