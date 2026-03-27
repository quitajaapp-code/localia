-- Insert admin role for user
INSERT INTO public.user_roles (user_id, role) 
VALUES ('21a2268b-6ad9-41d6-baf8-4be333dc5199', 'admin')
ON CONFLICT (user_id, role) DO NOTHING;