-- Enable RLS
ALTER DATABASE postgres SET "app.jwt_secret" TO 'your-jwt-secret';

-- Create custom types
CREATE TYPE client_type AS ENUM ('ФОП_1', 'ФОП_2', 'ФОП_3', 'ТОВ', 'ПП');
CREATE TYPE tax_system AS ENUM ('загальна', 'спрощена');
CREATE TYPE report_frequency AS ENUM ('щомісячно', 'щокварталу', 'щорічно');
CREATE TYPE report_status AS ENUM ('очікується', 'в_роботі', 'подано');
CREATE TYPE payment_status AS ENUM ('сплачено', 'не_сплачено');

-- Clients table
CREATE TABLE clients (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    tax_id VARCHAR(50) NOT NULL UNIQUE,
    type client_type NOT NULL,
    tax_system tax_system NOT NULL,
    contact_person VARCHAR(255),
    phone VARCHAR(20),
    email VARCHAR(255),
    address TEXT,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Report templates table
CREATE TABLE report_templates (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    frequency report_frequency NOT NULL,
    deadline_day INTEGER NOT NULL CHECK (deadline_day BETWEEN 1 AND 31),
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Client reports table
CREATE TABLE client_reports (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    report_template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    due_date DATE NOT NULL,
    status report_status DEFAULT 'очікується',
    price DECIMAL(10,2),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Payments table
CREATE TABLE payments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    period VARCHAR(7) NOT NULL, -- Format: YYYY-MM
    amount DECIMAL(10,2) NOT NULL,
    status payment_status DEFAULT 'не_сплачено',
    paid_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default report templates
INSERT INTO report_templates (name, frequency, deadline_day, description) VALUES
('ЄСВ', 'щомісячно', 20, 'Єдиний соціальний внесок'),
('ПДФО', 'щомісячно', 20, 'Податок на доходи фізичних осіб'),
('ПДВ', 'щомісячно', 20, 'Податок на додану вартість'),
('Фінансова звітність', 'щокварталу', 25, 'Квартальна фінансова звітність'),
('Єдиний податок', 'щокварталу', 25, 'Звітність по єдиному податку'),
('Річна декларація', 'щорічно', 31, 'Річна податкова декларація');

-- Enable RLS
ALTER TABLE clients ENABLE ROW LEVEL SECURITY;
ALTER TABLE client_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own clients" ON clients FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own clients" ON clients FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own clients" ON clients FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own clients" ON clients FOR DELETE USING (auth.uid() = user_id);

CREATE POLICY "Users can view reports for their clients" ON client_reports FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_reports.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert reports for their clients" ON client_reports FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_reports.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update reports for their clients" ON client_reports FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_reports.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete reports for their clients" ON client_reports FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_reports.client_id AND clients.user_id = auth.uid())
);

CREATE POLICY "Users can view payments for their clients" ON payments FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert payments for their clients" ON payments FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update payments for their clients" ON payments FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete payments for their clients" ON payments FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = payments.client_id AND clients.user_id = auth.uid())
);

-- Report templates are public (read-only)
CREATE POLICY "Everyone can view report templates" ON report_templates FOR SELECT USING (true);

-- Create indexes for better performance
CREATE INDEX idx_clients_user_id ON clients(user_id);
CREATE INDEX idx_clients_tax_id ON clients(tax_id);
CREATE INDEX idx_client_reports_client_id ON client_reports(client_id);
CREATE INDEX idx_client_reports_due_date ON client_reports(due_date);
CREATE INDEX idx_client_reports_status ON client_reports(status);
CREATE INDEX idx_payments_client_id ON payments(client_id);
CREATE INDEX idx_payments_period ON payments(period);
CREATE INDEX idx_payments_status ON payments(status);

-- Update triggers
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_clients_updated_at BEFORE UPDATE ON clients
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_client_reports_updated_at BEFORE UPDATE ON client_reports
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE ON payments
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();