-- ============================================================
-- FIX: D DASHBOARD READ ACCESS (God Mode)
-- ============================================================

-- 1. Leads Table Policies
-- Allow anyone with the API Key (Anon) to READ leads
CREATE POLICY "Enable read access for all users"
ON "public"."leads"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);

-- Allow authenticated users (e.g. You) to UPDATE leads (e.g. change status)
CREATE POLICY "Enable update access for authenticated users"
ON "public"."leads"
AS PERMISSIVE
FOR UPDATE
TO authenticated
USING (true)
WITH CHECK (true);


-- 2. System Metrics Policies (For Auditor Charts)
CREATE POLICY "Enable read access for metrics"
ON "public"."system_metrics"
AS PERMISSIVE
FOR SELECT
TO public
USING (true);
