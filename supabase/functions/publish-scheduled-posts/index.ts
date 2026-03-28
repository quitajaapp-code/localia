import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

async function getAccessToken(
  supabase: ReturnType<typeof createClient>,
  userId: string,
): Promise<string | null> {
  const ENCRYPTION_KEY = Deno.env.get("TOKEN_ENCRYPTION_KEY") || "";

  const { data: tokenRow } = await supabase
    .from("oauth_tokens")
    .select("access_token, access_token_encrypted, refresh_token, refresh_token_encrypted, expires_at")
    .eq("user_id", userId)
    .eq("provider", "google")
    .maybeSingle();

  if (!tokenRow) return null;

  const isExpired = tokenRow.expires_at && new Date(tokenRow.expires_at) <= new Date();

  // Estratégia 1: token em texto plano (legado, antes da encriptação)
  if (!isExpired && tokenRow.access_token) {
    return tokenRow.access_token;
  }

  // Estratégia 2: token encriptado
  if (!isExpired && tokenRow.access_token_encrypted && ENCRYPTION_KEY) {
    try {
      const { data: decrypted } = await supabase.rpc("decrypt_token", {
        encrypted_data: tokenRow.access_token_encrypted,
        secret_key: ENCRYPTION_KEY,
      });
      if (decrypted) return decrypted;
    } catch {
      console.warn("decrypt failed, trying refresh");
    }
  }

  // Estratégia 3: refresh token
  const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_CLIENT_ID");
  const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_CLIENT_SECRET");

  let refreshToken: string | null = tokenRow.refresh_token || null;

  if (!refreshToken && tokenRow.refresh_token_encrypted && ENCRYPTION_KEY) {
    try {
      const { data: decryptedRefresh } = await supabase.rpc("decrypt_token", {
        encrypted_data: tokenRow.refresh_token_encrypted,
        secret_key: ENCRYPTION_KEY,
      });
      refreshToken = decryptedRefresh || null;
    } catch {
      return null;
    }
  }

  if (!refreshToken || !GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) return null;

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      client_id: GOOGLE_CLIENT_ID,
      client_secret: GOOGLE_CLIENT_SECRET,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!res.ok) return null;

  const data = await res.json();
  const newAccessToken: string = data.access_token;
  const expiresAt = new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString();

  // Salva o novo token (texto plano — encriptação é feita pelo gmb-sync)
  await supabase
    .from("oauth_tokens")
    .update({ access_token: newAccessToken, expires_at: expiresAt })
    .eq("user_id", userId)
    .eq("provider", "google");

  return newAccessToken;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

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

    const results: Array<{ post_id: string; status: string; detail?: string }> = [];

    for (const post of posts) {
      try {
        const { data: biz } = await supabase
          .from("businesses")
          .select("user_id, gmb_location_id")
          .eq("id", post.business_id)
          .single();

        if (!biz?.gmb_location_id) {
          await supabase.from("posts").update({ status: "erro" }).eq("id", post.id);
          results.push({ post_id: post.id, status: "no_gmb_connection" });
          continue;
        }

        const accessToken = await getAccessToken(supabase, biz.user_id);

        if (!accessToken) {
          await supabase.from("posts").update({ status: "erro" }).eq("id", post.id);
          results.push({ post_id: post.id, status: "no_token" });
          continue;
        }

        const locationId = biz.gmb_location_id;
        const gmbBody: Record<string, unknown> = {
          languageCode: "pt-BR",
          summary: post.texto,
          topicType: "STANDARD",
        };

        if (post.imagem_url) {
          gmbBody.media = [{ mediaFormat: "PHOTO", sourceUrl: post.imagem_url }];
        }

        // API GMB v4 para localPosts — endpoint correto e ativo
        const gmbRes = await fetch(
          `https://mybusiness.googleapis.com/v4/${locationId}/localPosts`,
          {
            method: "POST",
            headers: {
              Authorization: `Bearer ${accessToken}`,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(gmbBody),
          },
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
          console.error(`GMB publish error for post ${post.id} (${gmbRes.status}):`, errText);
          await supabase.from("posts").update({ status: "erro" }).eq("id", post.id);
          results.push({
            post_id: post.id,
            status: `gmb_error_${gmbRes.status}`,
            detail: errText.slice(0, 200),
          });
        }
      } catch (innerErr) {
        console.error(`Error publishing post ${post.id}:`, innerErr);
        await supabase.from("posts").update({ status: "erro" }).eq("id", post.id);
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
