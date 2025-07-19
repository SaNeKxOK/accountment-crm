-- Add custom report type functionality
-- This allows reports to either use a template or have a custom manually entered type

-- Add custom_report_name column to client_reports table
ALTER TABLE client_reports 
ADD COLUMN IF NOT EXISTS custom_report_name VARCHAR(255);

-- Make report_template_id nullable since we can now have custom report types
ALTER TABLE client_reports 
ALTER COLUMN report_template_id DROP NOT NULL;

-- Add constraint to ensure either template or custom name is provided
ALTER TABLE client_reports 
ADD CONSTRAINT check_report_type 
CHECK (
    (report_template_id IS NOT NULL AND custom_report_name IS NULL) OR
    (report_template_id IS NULL AND custom_report_name IS NOT NULL)
);

-- Create index for custom report names
CREATE INDEX IF NOT EXISTS idx_client_reports_custom_name ON client_reports(custom_report_name);

-- Update the unique constraint to include custom report name
ALTER TABLE client_reports 
DROP CONSTRAINT IF EXISTS unique_client_report_period;

ALTER TABLE client_reports 
ADD CONSTRAINT unique_client_report_period 
UNIQUE (client_id, report_template_id, custom_report_name, period);

-- Comment explaining the new functionality
COMMENT ON COLUMN client_reports.custom_report_name IS 'Custom report type name when not using a predefined template. Mutually exclusive with report_template_id';
COMMENT ON CONSTRAINT check_report_type ON client_reports IS 'Ensures either template_id or custom_report_name is provided, but not both';