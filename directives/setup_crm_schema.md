# Directive: Setup CRM Schema

**Goal**: Initialize the Supabase database with Multi-Tenancy support and Deduplication logic.

**Inputs**:
- Existing Supabase Project URL/Keys (in `.env` or hardcoded).
- `kasi-crm-schema.sql` (The deterministic Execution script).

**Steps**:
1. Run `kasi-crm-schema.sql` in Supabase SQL Editor.
2. Verify tables: `organizations`, `profiles`, `contacts`, `campaigns`.
3. Verify RLS policies are enabled.
4. Verify duplicates are removed from `prospects`.

**Edge Cases**:
- Table duplicates: Script checks `IF NOT EXISTS` or queries `information_schema`.
- Constraint duplicates: Script uses `DO $$ ... IF NOT EXISTS` block.

**Output**:
- A Production-Ready Database Schema.
