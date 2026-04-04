SELECT cron.schedule(
  'benchmark-weekly',
  '0 2 * * 1',
  $$
  SELECT net.http_post(
    url := 'https://ogyiaxcdqajmoiryatfb.supabase.co/functions/v1/cron-benchmark',
    headers := '{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9neWlheGNkcWFqbW9pcnlhdGZiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1NTQyODIsImV4cCI6MjA5MDEzMDI4Mn0.CJsjo1hxhjDZVqQjkJJwqG-jHi3l8Yt9swdgI8rDPxo"}'::jsonb,
    body := concat('{"time": "', now(), '"}')::jsonb
  ) AS request_id;
  $$
);