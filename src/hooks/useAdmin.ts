import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "./useAuth";

export function useAdmin() {
  const { user, loading: authLoading } = useAuth();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const check = async () => {
      if (authLoading) {
        if (active) setLoading(true);
        return;
      }

      if (!user) {
        if (active) {
          setIsAdmin(false);
          setLoading(false);
        }
        return;
      }

      if (active) setLoading(true);

      const { data, error } = await supabase.rpc("has_role", {
        _user_id: user.id,
        _role: "admin",
      });

      if (!active) return;
      setIsAdmin(!error && data === true);
      setLoading(false);
    };

    void check();

    return () => {
      active = false;
    };
  }, [authLoading, user?.id]);

  return { isAdmin, loading };
}
