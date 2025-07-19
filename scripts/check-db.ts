import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

config({ path: ".env.local" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkDatabase() {
  try {
    console.log("🔍 Checking database connection...");

    // Check if tables exist
    const { data: tables, error: tablesError } = await supabase
      .from("information_schema.tables")
      .select("table_name")
      .eq("table_schema", "public");

    if (tablesError) {
      console.error("❌ Error checking tables:", tablesError);
      return;
    }

    console.log("📊 Tables found:", tables?.map((t) => t.table_name) || []);

    // Check if report templates exist
    const { data: templates, error: templatesError } = await supabase
      .from("report_templates")
      .select("name");

    if (templatesError) {
      console.error("❌ Error checking report templates:", templatesError);
      return;
    }

    console.log("📋 Report templates found:", templates?.length || 0);

    // Check users
    const { data: users, error: usersError } =
      await supabase.auth.admin.listUsers();

    if (usersError) {
      console.error("❌ Error checking users:", usersError);
      return;
    }

    console.log("👥 Users found:", users.users?.length || 0);
    users.users?.forEach((user) => {
      console.log(
        `  - ${user.email} (confirmed: ${
          user.email_confirmed_at ? "yes" : "no"
        })`
      );
    });
  } catch (error) {
    console.error("❌ Database check failed:", error);
  }
}

checkDatabase();
