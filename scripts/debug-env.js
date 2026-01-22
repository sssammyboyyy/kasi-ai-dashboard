console.log("Checking Env Vars...");
console.log("URL:", process.env.NEXT_PUBLIC_SUPABASE_URL ? "Exists" : "Missing");
console.log("KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "Exists" : "Missing");
