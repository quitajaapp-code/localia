import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Fetch scheduled posts that are due
    const now = new Date().toISOString();
    const { data: posts, error: postsError } = await supabase
      .from("posts")
      .select("id, business_id, texto, imagem_url, tipo")
      .eq("status", "agendado")
      .lte("agendado_para", now);

    if (postsError) throw postsError;
    if (!posts?.length) {
      return new Response(JSON.stringify({ message: "No posts to publish", count: 0 }), {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const results: Array<{ post_id: string; status: string }> = [];

    for (const post of posts) {
      try {
        // Get business and user info
        const { data: biz } = await supabase
          .from("businesses")
          .select("user_id, gmb_location_id")
          .eq("id", post.business_id)
          .single();

        if (!biz?.gmb_location_id) {
          await supabase
            .from("posts")
            .update({ status: "erro" })
            .eq("id", post.id);
          results.push({ post_id: post.id, status: "no_gmb_connection" });
          continue;
        }

        // Get OAuth token (use encrypted version)
        const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";
        const { data: tokenRow } = await supabase
          .from("oauth_tokens")
          .select("access_token_encrypted, expires_at")
          .eq("user_id", biz.user_id)
          .eq("provider", "google")
          .single();

        if (!tokenRow?.access_token_encrypted) {
          await supabase
            .from("posts")
            .update({ status: "erro" })
            .eq("id", post.id);
          results.push({ post_id: post.id, status: "no_token" });
          continue;
        }

        // Decrypt access token
        let accessToken: string;
        try {
          const { data: decrypted, error: decErr } = await supabase.rpc("decrypt_token", {
            encrypted_data: tokenRow.access_token_encrypted,
            secret_key: ENCRYPTION_KEY,
          });
          if (decErr || !decrypted) throw decErr || new Error("Decrypt returned null");
          accessToken = decrypted;
        } catch (decryptErr) {
          console.error(`Failed to decrypt token for post ${post.id}:`, decryptErr);
          await supabase.from("posts").update({ status: "erro" }).eq("id", post.id);
          results.push({ post_id: post.id, status: "decrypt_error" });
          continue;
        }

        // Publish to GMB API
        const locationId = biz.gmb_location_id;
        const gmbBody: Record<string, unknown> = {
          languageCode: "pt-BR",
          summary: post.texto,
          topicType: "STANDARD",
        };

        if (post.imagem_url) {
          gmbBody.media = [{ mediaFormat: "PHOTO", sourceUrl: post.imagem_url }];
        }

        const gmbRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${tokenRow.access_token}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gmbBody),
          }
        );

        if (gmbRes.ok) {
          const gmbPost = await gmbRes.json();
          await supabase
            .from("posts")
            .update({
              status: "publicado",
              publicado_em: new Date().toISOString(),
              gmb_post_id: gmbPost.name || null,
            })
            .eq("id", post.id);
          results.push({ post_id: post.id, status: "published" });
        } else {
          const errText = await gmbRes.text();
          console.error(`GMB publish error for post ${post.id}:`, errText);
          await supabase
            .from("posts")
            .update({ status: "erro" })
            .eq("id", post.id);
          results.push({ post_id: post.id, status: `gmb_error_${gmbRes.status}` });
        }
      } catch (innerErr) {
        console.error(`Error publishing post ${post.id}:`, innerErr);
        await supabase
          .from("posts")
          .update({ status: "erro" })
          .eq("id", post.id);
        results.push({ post_id: post.id, status: "error" });
      }
    }

    return new Response(JSON.stringify({ results, count: results.length }), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (error: unknown) {
    console.error("publish-scheduled-posts error:", error);
    const msg = error instanceof Error ? error.message : "Unknown error";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
