CREATE INDEX IF NOT EXISTS idx_agent_actions_orchestrator
  ON agent_actions(business_id, agent, created_at DESC)
  WHERE agent = 'orchestrator';

CREATE OR REPLACE VIEW public.orchestration_history AS
SELECT
  aa.id,
  aa.business_id,
  b.nome AS business_nome,
  b.nicho,
  b.cidade,
  b.estado,
  aa.created_at,
  aa.input_data->'agents_triggered' AS agents_triggered,
  aa.input_data->'business_state' AS business_state,
  aa.output_data->'agents_run' AS agents_run,
  aa.output_data->'results_summary' AS results_summary
FROM agent_actions aa
JOIN businesses b ON b.id = aa.business_id
WHERE aa.agent = 'orchestrator'
ORDER BY aa.created_at DESC;

GRANT SELECT ON public.orchestration_history TO authenticated;