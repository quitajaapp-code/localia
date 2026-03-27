import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Website, WebsiteConfig, defaultWebsiteConfig } from "@/types/website";

export function useWebsite(businessId: string | undefined) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!businessId) { setLoading(false); return; }
    fetchWebsite();
  }, [businessId]);

  async function fetchWebsite() {
    setLoading(true);
    const { data } = await supabase
      .from("websites" as any)
      .select("*")
      .eq("business_id", businessId!)
      .single();
    if (data) setWebsite(data as any as Website);
    setLoading(false);
  }

  async function createWebsite(slug: string) {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !businessId) return { data: null, error: new Error("Not authenticated") };
    const { data, error } = await supabase
      .from("websites" as any)
      .insert({
        business_id: businessId,
        user_id: user.id,
        slug: slug.toLowerCase().replace(/[^a-z0-9-]/g, '-'),
        config: defaultWebsiteConfig as any,
        theme: 'dark',
        primary_color: '#6366F1',
      } as any)
      .select()
      .single();
    if (!error && data) setWebsite(data as any as Website);
    return { data, error };
  }

  async function saveWebsite(updates: Partial<Website>) {
    if (!website) return;
    setSaving(true);
    const { data, error } = await supabase
      .from("websites" as any)
      .update({ ...updates, updated_at: new Date().toISOString() } as any)
      .eq("id", website.id)
      .select()
      .single();
    if (!error && data) setWebsite(data as any as Website);
    setSaving(false);
    return { data, error };
  }

  async function togglePublish() {
    if (!website) return;
    return saveWebsite({
      published: !website.published,
      ...(website.published ? {} : { published_at: new Date().toISOString() }),
    });
  }

  return { website, loading, saving, fetchWebsite, createWebsite, saveWebsite, togglePublish };
}

export function usePublicSite(slugOrDomain: string) {
  const [website, setWebsite] = useState<Website | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    if (!slugOrDomain) return;
    fetchPublicSite();
  }, [slugOrDomain]);

  async function fetchPublicSite() {
    setLoading(true);
    let { data } = await supabase
      .from("websites" as any)
      .select("*")
      .eq("slug", slugOrDomain)
      .eq("published", true)
      .single();

    if (!data) {
      const result = await supabase
        .from("websites" as any)
        .select("*")
        .eq("custom_domain", slugOrDomain)
        .eq("published", true)
        .single();
      data = result.data;
    }

    if (data) {
      setWebsite(data as any as Website);
      supabase.from("website_visits" as any).insert({
        website_id: (data as any).id,
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
      } as any);
    } else {
      setNotFound(true);
    }
    setLoading(false);
  }

  return { website, loading, notFound };
}
