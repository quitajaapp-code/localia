
CREATE OR REPLACE FUNCTION public.create_agent_cron_job(
  p_job_name text,
  p_schedule text,
  p_function_url text,
  p_body text,
  p_anon_key text
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog', 'extensions'
AS $$
BEGIN
  -- Try to unschedule existing job first
  BEGIN
    PERFORM cron.unschedule(p_job_name);
  EXCEPTION WHEN OTHERS THEN
    -- Job doesn't exist, that's fine
    NULL;
  END;

  -- Schedule new job using pg_net
  PERFORM cron.schedule(
    p_job_name,
    p_schedule,
    format(
      $sql$
      SELECT extensions.http_post(
        url := %L,
        headers := jsonb_build_object(
          'Content-Type', 'application/json',
          'Authorization', 'Bearer %s'
        ),
        body := %L::jsonb
      ) AS request_id;
      $sql$,
      p_function_url,
      p_anon_key,
      p_body
    )
  );
END;
$$;

CREATE OR REPLACE FUNCTION public.remove_agent_cron_job(p_job_name text)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public', 'pg_catalog'
AS $$
BEGIN
  PERFORM cron.unschedule(p_job_name);
EXCEPTION WHEN OTHERS THEN
  NULL;
END;
$$;
