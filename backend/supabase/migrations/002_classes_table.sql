-- T009: Classes table migration
-- Creates the classes table for grouping students in semester-long competitions

CREATE TABLE IF NOT EXISTS classes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    invite_code VARCHAR(20) UNIQUE NOT NULL,
    semester VARCHAR(50) NOT NULL,
    start_date DATE NOT NULL,
    end_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Add constraints
ALTER TABLE classes 
ADD CONSTRAINT check_dates 
CHECK (end_date > start_date);

ALTER TABLE classes
ADD CONSTRAINT check_name_not_empty
CHECK (trim(name) != '');

ALTER TABLE classes
ADD CONSTRAINT check_semester_not_empty
CHECK (trim(semester) != '');

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_invite_code ON classes(invite_code);
CREATE INDEX IF NOT EXISTS idx_class_is_active ON classes(is_active);
CREATE INDEX IF NOT EXISTS idx_class_semester ON classes(semester);
CREATE INDEX IF NOT EXISTS idx_class_dates ON classes(start_date, end_date);

-- Function to generate invite codes
CREATE OR REPLACE FUNCTION generate_invite_code()
RETURNS TEXT AS $$
DECLARE
    code TEXT;
    exists_check INT;
BEGIN
    LOOP
        -- Generate 6 character alphanumeric code
        code := upper(substring(md5(random()::text) from 1 for 6));
        
        -- Check if it already exists
        SELECT COUNT(*) INTO exists_check
        FROM classes
        WHERE invite_code = code;
        
        -- If unique, return it
        IF exists_check = 0 THEN
            RETURN code;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Function to check if class is currently active
CREATE OR REPLACE FUNCTION is_class_active(class_uuid UUID)
RETURNS BOOLEAN AS $$
DECLARE
    class_record RECORD;
BEGIN
    SELECT is_active, start_date, end_date
    INTO class_record
    FROM classes
    WHERE id = class_uuid;
    
    IF NOT FOUND THEN
        RETURN FALSE;
    END IF;
    
    RETURN class_record.is_active 
           AND CURRENT_DATE >= class_record.start_date 
           AND CURRENT_DATE <= class_record.end_date;
END;
$$ LANGUAGE plpgsql;