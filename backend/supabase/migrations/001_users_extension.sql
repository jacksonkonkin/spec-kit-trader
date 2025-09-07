-- T008: Users extension migration
-- Creates helper functions for user profile access
-- Note: Cannot modify auth.users table directly in Supabase

-- Create a function to get user profile info (used by views)
CREATE OR REPLACE FUNCTION get_user_profile(user_uuid UUID)
RETURNS TABLE(
    id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email_confirmed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.email_confirmed_at
    FROM auth.users u
    WHERE u.id = user_uuid;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create a function to get current user profile
CREATE OR REPLACE FUNCTION get_current_user_profile()
RETURNS TABLE(
    id UUID,
    email TEXT,
    created_at TIMESTAMP WITH TIME ZONE,
    email_confirmed_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        u.id,
        u.email::TEXT,
        u.created_at,
        u.email_confirmed_at
    FROM auth.users u
    WHERE u.id = auth.uid();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;