-- Create code_templates table for storing language-specific solution templates
CREATE TABLE code_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    problem_id UUID NOT NULL REFERENCES problems(id) ON DELETE CASCADE,
    language VARCHAR(50) NOT NULL,
    template_code TEXT NOT NULL,
    input_params JSONB NOT NULL DEFAULT '[]'::jsonb,
    return_type VARCHAR(50) NOT NULL,
    description TEXT,
    created_at TIMESTAMP DEFAULT now(),
    updated_at TIMESTAMP DEFAULT now(),
    UNIQUE(problem_id, language)
);

-- Create index for faster queries
CREATE INDEX idx_code_templates_problem_id ON code_templates(problem_id);
CREATE INDEX idx_code_templates_language ON code_templates(language);

-- Enable RLS (Row Level Security)
ALTER TABLE code_templates ENABLE ROW LEVEL SECURITY;

-- Allow public read access (users can view templates)
CREATE POLICY "Allow public read" ON code_templates
    FOR SELECT USING (true);

-- Allow authenticated users to insert/update
CREATE POLICY "Allow authenticated users to insert" ON code_templates
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow authenticated users to update" ON code_templates
    FOR UPDATE USING (auth.role() = 'authenticated');