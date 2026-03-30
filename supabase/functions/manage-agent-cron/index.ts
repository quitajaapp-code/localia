/**
 * MANAGE AGENT CRON
 * Manages pg_cron jobs for automated agent execution.
 * Called from the frontend to update schedules.
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

const AGENT_CRON_MAP: Record<string, { function_name: string; job_prefix: string }> = {
  reviews: { function_name: "agent-reviews", job_prefix: "agent-reviews" },
  posts: { function_name: "agent-posts", job_prefix: "agent-posts" },
  profile: { function_name: "agent-profile", job_prefix: "agent-profile" },
  ads: { function_name: "agent-ads", job_prefix: "agent-ads" },
  orchestrator: { function_name: "agent-orchestrator", job_prefix: "agent-orchestrator" },
};

const SCHEDULE_PRESETS: Record<string, string> = {
  "every_6h": "0 */6 * * *",
  "every_12h": "0 */12 * * *",
  "daily_9am": "0 9 * * *",
  "daily_14h": "0 14 * * *",
  "twice_daily": "0 9,18 * * *",
  "weekly_mon": "0 9 * * 1",
  "weekly_wed_fri": "0 9 * * 3,5",
  "every_3_days": "0 9 */3 * *",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
  );

  try {
    const { action, business_id, agent, schedule_key } = await req.json();

    // Verify business ownership via JWT
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) throw new Error("Missing authorization");

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace("Bearer ", "")
    );
    if (authError || !user) throw new Error("Unauthorized");

    const { data: biz } = await supabase
      .from("businesses")
      .select("id")
      .eq("id", business_id)
      .eq("user_id", user.id)
      .single();
    if (!biz) throw new Error("Business not found or unauthorized");

    const SUPABASE_URL = Deno.env.get("SUPABASE_URL")!;
    const ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || Deno.env.get("SUPABASE_PUBLISHABLE_KEY")!;

    if (action === "set_schedule") {
      const agentConfig = AGENT_CRON_MAP[agent];
      if (!agentConfig) throw new Error(`Unknown agent: ${agent}`);

      const cronExpression = schedule_key ? SCHEDULE_PRESETS[schedule_key] : null;
      const jobName = `${agentConfig.job_prefix}-${business_id.slice(0, 8)}`;

      // Remove existing job for this agent+business
      try {
        await supabase.rpc("cron_unschedule_safe", { job_name: jobName });
      } catch {
        // Job might not exist, that's OK
        // Try direct SQL via service role
        const { error } = await supabase.from("_cron_cleanup").select("*").limit(0);
        // Fallback: just proceed
      }

      if (cronExpression) {
        // Create new cron job
        const functionUrl = `${SUPABASE_URL}/functions/v1/${agentConfig.function_name}`;
        const body = JSON.stringify({ business_id, mode: "single" });

        // Use pg_net to schedule HTTP calls
        const { error: cronError } = await supabase.rpc("create_agent_cron_job", {
          p_job_name: jobName,
          p_schedule: cronExpression,
          p_function_url: functionUrl,
          p_body: body,
          p_anon_key: ANON_KEY,
        });

        if (cronError) {
          console.error("Cron create error:", cronError);
          throw new Error(`Failed to create cron job: ${cronError.message}`);
        }
      }

      // Save schedule to agent_settings
      const cronColumn = `${agent === "reviews" ? "reviews" : agent === "posts" ? "posts" : agent === "profile" ? "profile" : "ads"}_cron`;
      await supabase
        .from("agent_settings")
        .upsert(
          { business_id, [cronColumn]: schedule_key || null, updated_at: new Date().toISOString() },
          { onConflict: "business_id" }
        );

      return new Response(JSON.stringify({
        success: true,
        job_name: jobName,
        schedule: cronExpression,
        schedule_key,
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_schedules") {
      const { data: settings } = await supabase
        .from("agent_settings")
        .select("reviews_cron, posts_cron, profile_cron, ads_cron")
        .eq("business_id", business_id)
        .maybeSingle();

      return new Response(JSON.stringify({
        schedules: {
          reviews: settings?.reviews_cron || null,
          posts: settings?.posts_cron || null,
          profile: settings?.profile_cron || null,
          ads: settings?.ads_cron || null,
        },
        presets: Object.entries(SCHEDULE_PRESETS).map(([key, cron]) => ({ key, cron })),
      }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    throw new Error(`Unknown action: ${action}`);
  } catch (e) {
    console.error("manage-agent-cron error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
