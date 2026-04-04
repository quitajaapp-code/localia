#!/bin/bash
# Testa a Edge Function cron-benchmark localmente ou em produção.
#
# Uso:
#   chmod +x scripts/test-cron-benchmark.sh
#   ./scripts/test-cron-benchmark.sh

SUPABASE_URL="https://ogyiaxcdqajmoiryatfb.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWlheGNkcWFqbW9pcnlhdGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQyODIsImV4cCI6MjA5MDEzMDI4Mn0.CJsjo1hxhjDZVqQjkJJwqG-jHi3l8Yt9swdgI8rDPxo"

echo "🔄 Invocando cron-benchmark..."
curl -s -X POST \
  "${SUPABASE_URL}/functions/v1/cron-benchmark" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -d '{"time": "manual-test"}' | python3 -m json.tool 2>/dev/null || echo "(resposta não-JSON)"

echo ""
echo "✅ Verifique os logs em:"
echo "   https://supabase.com/dashboard/project/ogyiaxcdqajmoiryatfb/functions/cron-benchmark/logs"
