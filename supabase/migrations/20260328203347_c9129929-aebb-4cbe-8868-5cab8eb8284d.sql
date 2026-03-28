create table public.template_usage (
  id uuid primary key default gen_random_uuid(),
  template_id uuid not null references public.whatsapp_templates(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  enviado_em timestamptz not null default now(),
  entregue boolean default false,
  respondido boolean default false,
  respondido_em timestamptz,
  canal text not null default 'whatsapp',
  erro text
);

alter table public.template_usage enable row level security;

create policy "Admins manage template_usage"
  on public.template_usage for all to authenticated
  using (public.has_role(auth.uid(), 'admin'))
  with check (public.has_role(auth.uid(), 'admin'));

create policy "Service role full access template_usage"
  on public.template_usage for all to service_role
  using (true) with check (true);

create index idx_template_usage_template_id on public.template_usage(template_id);
create index idx_template_usage_enviado_em on public.template_usage(enviado_em desc);