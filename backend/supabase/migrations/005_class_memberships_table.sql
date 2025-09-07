-- T012: Class memberships table migration
-- Creates the class_memberships table linking users to classes

CREATE TABLE IF NOT EXISTS class_memberships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    starting_balance DECIMAL(10,2) DEFAULT 100000 CHECK (starting_balance = 100000),
    joined_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    
    -- Unique constraint: one membership per user per class
    UNIQUE(class_id, user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_class_membership_class_id ON class_memberships(class_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_user_id ON class_memberships(user_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_composite ON class_memberships(class_id, user_id);
CREATE INDEX IF NOT EXISTS idx_class_membership_joined_at ON class_memberships(joined_at);

-- Function to validate class membership creation
CREATE OR REPLACE FUNCTION validate_class_membership()
RETURNS TRIGGER AS $$
DECLARE
    class_record RECORD;
BEGIN
    -- Check if class exists and is active
    SELECT is_active, start_date, end_date, invite_code
    INTO class_record
    FROM classes
    WHERE id = NEW.class_id;
    
    IF NOT FOUND THEN
        RAISE EXCEPTION 'Class not found';
    END IF;
    
    -- Check if class is still accepting new members
    IF NOT class_record.is_active THEN
        RAISE EXCEPTION 'Cannot join inactive class';
    END IF;
    
    -- Check if current date is within the valid enrollment period
    -- Allow joining before start date but not after end date
    IF CURRENT_DATE > class_record.end_date THEN
        RAISE EXCEPTION 'Cannot join class after end date';
    END IF;
    
    -- Validate that user is authenticated
    IF auth.uid() IS NULL THEN
        RAISE EXCEPTION 'User must be authenticated to join class';
    END IF;
    
    -- Ensure the user_id matches the authenticated user
    IF NEW.user_id != auth.uid() THEN
        RAISE EXCEPTION 'Cannot join class on behalf of another user';
    END IF;
    
    -- Check if user already has membership in this class
    IF EXISTS (
        SELECT 1 FROM class_memberships 
        WHERE class_id = NEW.class_id 
        AND user_id = NEW.user_id 
        AND id != COALESCE(NEW.id, '00000000-0000-0000-0000-000000000000'::UUID)
    ) THEN
        RAISE EXCEPTION 'User is already a member of this class';
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger
CREATE TRIGGER validate_class_membership
    BEFORE INSERT ON class_memberships
    FOR EACH ROW
    EXECUTE FUNCTION validate_class_membership();

-- Function to get class leaderboard
CREATE OR REPLACE FUNCTION get_class_leaderboard(class_uuid UUID)
RETURNS TABLE(
    user_id UUID,
    email TEXT,
    stock_symbol VARCHAR(10),
    company_name VARCHAR(255),
    purchase_price DECIMAL(10,2),
    shares INTEGER,
    initial_value DECIMAL(10,2),
    current_price DECIMAL(10,2),
    current_value DECIMAL(10,2),
    total_return DECIMAL(10,2),
    return_percentage DECIMAL(5,2),
    rank BIGINT,
    joined_at TIMESTAMP WITH TIME ZONE,
    purchase_date TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id as user_id,
        u.email::TEXT,
        p.stock_symbol,
        sp.company_name,
        p.purchase_price,
        p.shares,
        p.initial_value,
        sp.current_price,
        (p.shares * sp.current_price) as current_value,
        ((p.shares * sp.current_price) - p.initial_value) as total_return,
        (((p.shares * sp.current_price) - p.initial_value) / p.initial_value * 100) as return_percentage,
        RANK() OVER (ORDER BY 
            (((p.shares * sp.current_price) - p.initial_value) / p.initial_value) DESC
        ) as rank,
        cm.joined_at,
        p.purchase_date
    FROM class_memberships cm
    JOIN auth.users u ON cm.user_id = u.id
    LEFT JOIN portfolios p ON u.id = p.user_id
    LEFT JOIN stock_prices sp ON p.stock_symbol = sp.symbol
    WHERE cm.class_id = class_uuid
    ORDER BY return_percentage DESC NULLS LAST;
END;
$$ LANGUAGE plpgsql;

-- Function to join class by invite code
CREATE OR REPLACE FUNCTION join_class_by_invite_code(invite_code_param TEXT, user_uuid UUID)
RETURNS UUID AS $$
DECLARE
    class_uuid UUID;
    membership_uuid UUID;
BEGIN
    -- Find class by invite code
    SELECT id INTO class_uuid
    FROM classes
    WHERE invite_code = invite_code_param
    AND is_active = true;
    
    IF class_uuid IS NULL THEN
        RAISE EXCEPTION 'Invalid or inactive invite code: %', invite_code_param;
    END IF;
    
    -- Create membership
    INSERT INTO class_memberships (class_id, user_id)
    VALUES (class_uuid, user_uuid)
    RETURNING id INTO membership_uuid;
    
    RETURN membership_uuid;
END;
$$ LANGUAGE plpgsql;