
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rfacczttfdbrqpyguopy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJmYWNjenR0ZmRicnFweWd1b3B5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjQ4NTg2OTQsImV4cCI6MjA4MDQzNDY5NH0.xbPkq7qYhd-zQ4Xju8ySp5PooLz__Gq2vlmfACwXiFw';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
