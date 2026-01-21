import { serve } from "https://deno.land/std/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js";

serve(async (req) => {
  // 1. Verify webhook secret
  const webhookSecret = Deno.env.get("SUPABASE_AUTH_WEBHOOK_SECRET");
  const receivedSecret = req.headers.get("x-supabase-signature");

  if (!receivedSecret || receivedSecret !== webhookSecret) {
    return new Response("Unauthorized", { status: 401 });
  }

  // 2. Parse payload
  const payload = await req.json();

  // We only care about deletion
  if (payload.type !== "user.deleted") {
    return new Response("Ignored", { status: 200 });
  }

  const userId = payload.user.id;

  // 3. Admin client
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
  );

  // 4. Delete User row (CASCADE handles the rest)
  const { error } = await supabase
    .from("User")
    .delete()
    .eq("id", userId);

  if (error) {
    console.error(error);
    return new Response("DB error", { status: 500 });
  }

  return new Response("User cleaned", { status: 200 });
});
