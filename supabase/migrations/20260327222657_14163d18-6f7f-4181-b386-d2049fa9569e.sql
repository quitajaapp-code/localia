-- Add explicit RESTRICTIVE policy to block non-admin inserts on user_roles
CREATE POLICY "Block non-admin role changes" ON public.user_roles
AS RESTRICTIVE
FOR ALL TO authenticated
USING (true)
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));