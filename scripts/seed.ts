import { createClient } from "@supabase/supabase-js";
import { config } from "dotenv";

// Load environment variables
config({ path: ".env" });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing Supabase environment variables");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

const seedUsers = [
  {
    email: "accountant1@example.com",
    password: "password123",
    name: "Бухгалтер Олена Іванівна",
  },
  {
    email: "accountant2@example.com",
    password: "password123",
    name: "Бухгалтер Михайло Петрович",
  },
];

const seedData = {
  clients: [
    {
      name: "Іваненко Іван Іванович",
      tax_id: "1234567890",
      type: "ФОП_1",
      tax_system: "спрощена",
      contact_person: "Іваненко Іван Іванович",
      phone: "+380671234567",
      email: "ivan.ivanenko@gmail.com",
      address: "м. Київ, вул. Хрещатик, 1",
    },
    {
      name: "Петренко Петро Петрович",
      tax_id: "2345678901",
      type: "ФОП_2",
      tax_system: "загальна",
      contact_person: "Петренко Петро Петрович",
      phone: "+380672345678",
      email: "petro.petrenko@ukr.net",
      address: "м. Львів, вул. Свободи, 15",
    },
    {
      name: "Сидоренко Олена Миколаївна",
      tax_id: "3456789012",
      type: "ФОП_3",
      tax_system: "спрощена",
      contact_person: "Сидоренко Олена Миколаївна",
      phone: "+380673456789",
      email: "olena.sydorenko@gmail.com",
      address: "м. Харків, вул. Сумська, 32",
    },
    {
      name: 'ТОВ "Успішний Бізнес"',
      tax_id: "12345678",
      type: "ТОВ",
      tax_system: "загальна",
      contact_person: "Коваленко Андрій Сергійович",
      phone: "+380674567890",
      email: "info@uspishny.com.ua",
      address: "м. Дніпро, пр. Гагаріна, 72",
    },
    {
      name: 'ТОВ "Інноваційні Рішення"',
      tax_id: "23456789",
      type: "ТОВ",
      tax_system: "спрощена",
      contact_person: "Мельник Ольга Вікторівна",
      phone: "+380675678901",
      email: "contact@innovations.ua",
      address: "м. Одеса, вул. Дерибасівська, 5",
    },
    {
      name: 'ПП "Торговий Дім Україна"',
      tax_id: "34567890",
      type: "ПП",
      tax_system: "загальна",
      contact_person: "Шевченко Михайло Олександрович",
      phone: "+380676789012",
      email: "office@td-ukraine.com",
      address: "м. Запоріжжя, вул. Соборна, 120",
    },
    {
      name: "Кравченко Марія Василівна",
      tax_id: "4567890123",
      type: "ФОП_1",
      tax_system: "спрощена",
      contact_person: "Кравченко Марія Василівна",
      phone: "+380677890123",
      email: "maria.kravchenko@outlook.com",
      address: "м. Полтава, вул. Соборності, 24",
    },
    {
      name: "Бондаренко Олексій Григорович",
      tax_id: "5678901234",
      type: "ФОП_2",
      tax_system: "загальна",
      contact_person: "Бондаренко Олексій Григорович",
      phone: "+380678901234",
      email: "oleksiy.bondarenko@gmail.com",
      address: "м. Черкаси, вул. Шевченка, 67",
    },
  ],
};

async function getReportTemplates() {
  const { data, error } = await supabase.from("report_templates").select("*");

  if (error) throw error;
  return data;
}

async function generateClientReports(clientId: string, reportTemplates: any[]) {
  const reports = [];
  const currentDate = new Date();

  // Generate reports for the last 3 months
  for (let i = 0; i < 3; i++) {
    const reportDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );

    for (const template of reportTemplates) {
      // Not all clients need all reports every month
      if (Math.random() > 0.3) continue;

      const dueDate = new Date(
        reportDate.getFullYear(),
        reportDate.getMonth() + 1,
        template.deadline_day
      );
      const statuses = ["очікується", "в_роботі", "подано"];
      const prices = {
        ЄСВ: 500,
        ПДФО: 400,
        ПДВ: 800,
        "Фінансова звітність": 1200,
        "Єдиний податок": 600,
        "Річна декларація": 2000,
      };

      reports.push({
        client_id: clientId,
        report_template_id: template.id,
        due_date: dueDate.toISOString().split("T")[0],
        status:
          i === 0
            ? "очікується"
            : statuses[Math.floor(Math.random() * statuses.length)],
        price: prices[template.name as keyof typeof prices] || 500,
        notes:
          i === 0
            ? "Поточний звіт"
            : `Звіт за ${reportDate.toLocaleDateString("uk-UA", {
                month: "long",
                year: "numeric",
              })}`,
      });
    }
  }

  return reports;
}

async function generatePayments(clientId: string) {
  const payments = [];
  const currentDate = new Date();

  // Generate payments for the last 6 months
  for (let i = 0; i < 6; i++) {
    const paymentDate = new Date(
      currentDate.getFullYear(),
      currentDate.getMonth() - i,
      1
    );
    const period = `${paymentDate.getFullYear()}-${String(
      paymentDate.getMonth() + 1
    ).padStart(2, "0")}`;

    // Some months might not have payments
    if (Math.random() > 0.8) continue;

    const amounts = [1000, 1500, 2000, 2500, 3000, 3500, 4000];
    const statuses = i < 2 ? ["не_сплачено", "сплачено"] : ["сплачено"];
    const status = statuses[Math.floor(Math.random() * statuses.length)];

    payments.push({
      client_id: clientId,
      period,
      amount: amounts[Math.floor(Math.random() * amounts.length)],
      status,
      paid_at:
        status === "сплачено"
          ? new Date(
              paymentDate.getTime() + Math.random() * 30 * 24 * 60 * 60 * 1000
            ).toISOString()
          : null,
    });
  }

  return payments;
}

async function createTestUsers() {
  console.log("👤 Creating test users...");
  const createdUsers = [];

  for (const userData of seedUsers) {
    const { data, error } = await supabase.auth.admin.createUser({
      email: userData.email,
      password: userData.password,
      email_confirm: true,
      user_metadata: {
        name: userData.name,
      },
    });

    if (error) {
      console.error(`Error creating user ${userData.email}:`, error);
      continue;
    }

    if (data.user) {
      createdUsers.push({
        id: data.user.id,
        email: userData.email,
        name: userData.name,
      });
      console.log(`✅ Created user: ${userData.name} (${userData.email})`);
    }
  }

  return createdUsers;
}

async function distributeClientsToUsers(clients: any[], users: any[]) {
  // Distribute clients evenly among users
  return clients.map((client, index) => ({
    ...client,
    user_id: users[index % users.length].id,
  }));
}

async function seed() {
  try {
    console.log("🌱 Starting database seeding...");

    // Create test users first
    const testUsers = await createTestUsers();
    if (testUsers.length === 0) {
      console.error("❌ Failed to create any test users. Aborting seed.");
      return;
    }

    // Get existing report templates
    const reportTemplates = await getReportTemplates();
    console.log(`📋 Found ${reportTemplates.length} report templates`);

    // Insert clients with distributed user IDs
    console.log("👥 Inserting clients...");
    const clientsWithUserId = await distributeClientsToUsers(
      seedData.clients,
      testUsers
    );

    const { data: insertedClients, error: clientsError } = await supabase
      .from("clients")
      .insert(clientsWithUserId)
      .select();

    if (clientsError) {
      console.error("Error inserting clients:", clientsError);
      return;
    }

    console.log(`✅ Inserted ${insertedClients.length} clients`);

    // Generate and insert client reports
    console.log("📊 Generating client reports...");
    const allReports = [];

    for (const client of insertedClients) {
      const clientReports = await generateClientReports(
        client.id,
        reportTemplates
      );
      allReports.push(...clientReports);
    }

    const { data: insertedReports, error: reportsError } = await supabase
      .from("client_reports")
      .insert(allReports)
      .select();

    if (reportsError) {
      console.error("Error inserting reports:", reportsError);
      return;
    }

    console.log(`✅ Inserted ${insertedReports.length} client reports`);

    // Generate and insert payments
    console.log("💰 Generating payments...");
    const allPayments = [];

    for (const client of insertedClients) {
      const clientPayments = await generatePayments(client.id);
      allPayments.push(...clientPayments);
    }

    const { data: insertedPayments, error: paymentsError } = await supabase
      .from("payments")
      .insert(allPayments)
      .select();

    if (paymentsError) {
      console.error("Error inserting payments:", paymentsError);
      return;
    }

    console.log(`✅ Inserted ${insertedPayments.length} payments`);

    console.log("🎉 Database seeding completed successfully!");
    console.log(`
📊 Summary:
- ${testUsers.length} test users created
- ${insertedClients.length} clients
- ${insertedReports.length} reports  
- ${insertedPayments.length} payments
- 6 report templates (already existed)

👥 Test Users Created:
${testUsers
  .map((user) => `- ${user.name} (${user.email}) - password: password123`)
  .join("\n")}

🔑 You can now login with any of the test accounts!
    `);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
  }
}

seed();
