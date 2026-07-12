import "jsr:@supabase/functions-js/edge-runtime.d.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_EMAIL = "admin@pacenr.com";
const ADMIN_PASSWORD = "admin123";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;

    const { createClient } = await import("npm:@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    });

    const { data: existingUsers } = await supabase.auth.admin.listUsers();
    const existing = existingUsers?.users?.find((u: any) => u.email === ADMIN_EMAIL);

    let userId: string;

    if (existing) {
      userId = existing.id;
      await supabase.auth.admin.updateUserById(userId, {
        password: ADMIN_PASSWORD,
        email_confirm: true,
      });
    } else {
      const { data: newUser, error: createError } = await supabase.auth.admin.createUser({
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        email_confirm: true,
        user_metadata: { role: "super_admin", full_name: "System Administrator" },
      });

      if (createError) throw createError;
      userId = newUser.user.id;
    }

    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: userId,
        email: ADMIN_EMAIL,
        role: "super_admin",
        first_name: "System",
        last_name: "Administrator",
        is_active: true,
        must_change_password: false,
      },
      { onConflict: "id" }
    );

    if (profileError) throw profileError;

    return new Response(
      JSON.stringify({
        success: true,
        message: existing ? "Admin account verified" : "Admin account created",
        email: ADMIN_EMAIL,
      }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ success: false, error: err.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
