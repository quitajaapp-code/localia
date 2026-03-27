-- Remove redundant SELECT policy (covered by ALL policy)
DROP POLICY IF EXISTS "Admins can view all roles" ON public.user_roles;

-- Recreate ALL policy with explicit WITH CHECK to satisfy security scanner
DROP POLICY IF EXISTS "Admins can manage roles" ON public.user_roles;
CREATE POLICY "Admins can manage roles" ON public.user_roles
FOR ALL TO authenticated
USING (has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (has_role(auth.uid(), 'admin'::app_role));