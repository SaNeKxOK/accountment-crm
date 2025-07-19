-- Extend the existing report management schema

-- Update report_status enum to include new statuses
ALTER TYPE report_status ADD VALUE IF NOT EXISTS 'сплачено';

-- Add new columns to client_reports table
ALTER TABLE client_reports 
ADD COLUMN IF NOT EXISTS period VARCHAR(20), -- e.g., "March 2024", "Q1 2024", "2024"
ADD COLUMN IF NOT EXISTS submitted_date TIMESTAMP WITH TIME ZONE,
ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- Create client_report_configs table for client-specific report configurations
CREATE TABLE IF NOT EXISTS client_report_configs (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    client_id UUID REFERENCES clients(id) ON DELETE CASCADE,
    report_template_id UUID REFERENCES report_templates(id) ON DELETE CASCADE,
    price DECIMAL(10,2) NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(client_id, report_template_id)
);

-- Enable RLS for client_report_configs
ALTER TABLE client_report_configs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for client_report_configs
CREATE POLICY "Users can view report configs for their clients" ON client_report_configs FOR SELECT USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_report_configs.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can insert report configs for their clients" ON client_report_configs FOR INSERT WITH CHECK (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_report_configs.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can update report configs for their clients" ON client_report_configs FOR UPDATE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_report_configs.client_id AND clients.user_id = auth.uid())
);
CREATE POLICY "Users can delete report configs for their clients" ON client_report_configs FOR DELETE USING (
    EXISTS (SELECT 1 FROM clients WHERE clients.id = client_report_configs.client_id AND clients.user_id = auth.uid())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_client_report_configs_client_id ON client_report_configs(client_id);
CREATE INDEX IF NOT EXISTS idx_client_report_configs_template_id ON client_report_configs(report_template_id);
CREATE INDEX IF NOT EXISTS idx_client_reports_period ON client_reports(period);
CREATE INDEX IF NOT EXISTS idx_client_reports_submitted_date ON client_reports(submitted_date);

-- Update trigger for client_report_configs
CREATE TRIGGER update_client_report_configs_updated_at BEFORE UPDATE ON client_report_configs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Function to generate report instances for a client
CREATE OR REPLACE FUNCTION generate_report_instances(
    p_client_id UUID,
    p_year INTEGER DEFAULT EXTRACT(YEAR FROM CURRENT_DATE)
) RETURNS INTEGER AS $$
DECLARE
    config_record RECORD;
    template_record RECORD;
    instance_count INTEGER := 0;
    due_date DATE;
    period_text VARCHAR(20);
    month_num INTEGER;
    quarter_num INTEGER;
BEGIN
    -- Loop through all active report configurations for the client
    FOR config_record IN 
        SELECT crc.*, rt.name, rt.frequency, rt.deadline_day
        FROM client_report_configs crc
        JOIN report_templates rt ON crc.report_template_id = rt.id
        WHERE crc.client_id = p_client_id AND crc.is_active = true
    LOOP
        -- Generate instances based on frequency
        IF config_record.frequency = 'щомісячно' THEN
            -- Monthly reports - generate 12 instances
            FOR month_num IN 1..12 LOOP
                -- Calculate due date (deadline_day of next month)
                due_date := DATE(p_year, month_num + 1, config_record.deadline_day);
                
                -- Handle December (next year)
                IF month_num = 12 THEN
                    due_date := DATE(p_year + 1, 1, config_record.deadline_day);
                END IF;
                
                -- Create period text
                period_text := TO_CHAR(DATE(p_year, month_num, 1), 'FMMonth YYYY');
                
                -- Insert report instance if not exists
                INSERT INTO client_reports (
                    client_id, 
                    report_template_id, 
                    due_date, 
                    period, 
                    price, 
                    status
                ) VALUES (
                    p_client_id,
                    config_record.report_template_id,
                    due_date,
                    period_text,
                    config_record.price,
                    'очікується'
                )
                ON CONFLICT (client_id, report_template_id, period) DO NOTHING;
                
                instance_count := instance_count + 1;
            END LOOP;
            
        ELSIF config_record.frequency = 'щокварталу' THEN
            -- Quarterly reports - generate 4 instances
            FOR quarter_num IN 1..4 LOOP
                -- Calculate due date based on quarter
                CASE quarter_num
                    WHEN 1 THEN due_date := DATE(p_year, 4, config_record.deadline_day); -- Q1 due April
                    WHEN 2 THEN due_date := DATE(p_year, 7, config_record.deadline_day); -- Q2 due July
                    WHEN 3 THEN due_date := DATE(p_year, 10, config_record.deadline_day); -- Q3 due October
                    WHEN 4 THEN due_date := DATE(p_year + 1, 1, config_record.deadline_day); -- Q4 due January next year
                END CASE;
                
                -- Create period text
                period_text := 'Q' || quarter_num || ' ' || p_year;
                
                -- Insert report instance if not exists
                INSERT INTO client_reports (
                    client_id, 
                    report_template_id, 
                    due_date, 
                    period, 
                    price, 
                    status
                ) VALUES (
                    p_client_id,
                    config_record.report_template_id,
                    due_date,
                    period_text,
                    config_record.price,
                    'очікується'
                )
                ON CONFLICT (client_id, report_template_id, period) DO NOTHING;
                
                instance_count := instance_count + 1;
            END LOOP;
            
        ELSIF config_record.frequency = 'щорічно' THEN
            -- Annual reports - generate 1 instance
            -- Due date is deadline_day of January next year
            due_date := DATE(p_year + 1, 1, config_record.deadline_day);
            period_text := p_year::VARCHAR(4);
            
            -- Insert report instance if not exists
            INSERT INTO client_reports (
                client_id, 
                report_template_id, 
                due_date, 
                period, 
                price, 
                status
            ) VALUES (
                p_client_id,
                config_record.report_template_id,
                due_date,
                period_text,
                config_record.price,
                'очікується'
            )
            ON CONFLICT (client_id, report_template_id, period) DO NOTHING;
            
            instance_count := instance_count + 1;
        END IF;
    END LOOP;
    
    RETURN instance_count;
END;
$$ LANGUAGE plpgsql;

-- Add unique constraint to prevent duplicate report instances
ALTER TABLE client_reports 
ADD CONSTRAINT unique_client_report_period 
UNIQUE (client_id, report_template_id, period);

-- Comment explaining the system
COMMENT ON TABLE client_report_configs IS 'Client-specific report configurations defining which reports are assigned to each client with custom pricing';
COMMENT ON TABLE client_reports IS 'Individual report instances with specific periods and due dates generated from configurations';
COMMENT ON FUNCTION generate_report_instances IS 'Generates report instances for a client based on their active report configurations';