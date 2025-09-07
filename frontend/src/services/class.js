import { supabase } from '../lib/supabase.js';

/**
 * Class service for the Stock Trading Learning Platform
 * Handles class management, memberships, and invite codes
 */

/**
 * Get all available classes
 * @param {boolean} isActive - Filter by active status (optional)
 * @returns {Promise<Object>} List of classes
 */
export const getClasses = async (isActive = null) => {
  try {
    let query = supabase
      .from('classes')
      .select('*')
      .order('created_at', { ascending: false });

    if (isActive !== null) {
      query = query.eq('is_active', isActive);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting classes:', error);
    return { data: null, error };
  }
};

/**
 * Get class by ID
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Class details
 */
export const getClass = async (classId) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('id', classId)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting class:', error);
    return { data: null, error };
  }
};

/**
 * Get class by invite code
 * @param {string} inviteCode - Class invite code
 * @returns {Promise<Object>} Class details
 */
export const getClassByInviteCode = async (inviteCode) => {
  if (!inviteCode) {
    throw new Error('Invite code is required');
  }

  // Validate invite code format (6 alphanumeric characters)
  const inviteCodeRegex = /^[A-Z0-9]{6}$/;
  if (!inviteCodeRegex.test(inviteCode)) {
    throw new Error('Invalid invite code format');
  }

  try {
    const { data, error } = await supabase
      .from('classes')
      .select('*')
      .eq('invite_code', inviteCode.toUpperCase())
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: { message: 'Invalid invite code', code: 'INVALID_CODE' } };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting class by invite code:', error);
    return { data: null, error };
  }
};

/**
 * Join a class using invite code
 * @param {string} inviteCode - Class invite code
 * @returns {Promise<Object>} Class membership details
 */
export const joinClass = async (inviteCode) => {
  if (!inviteCode) {
    throw new Error('Invite code is required');
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated');
    }

    // Get class by invite code
    const { data: classData, error: classError } = await getClassByInviteCode(inviteCode);
    
    if (classError) {
      throw classError;
    }

    if (!classData) {
      throw new Error('Invalid invite code');
    }

    // Check if class is active
    if (!classData.is_active) {
      throw new Error('Class is not currently active');
    }

    // Check if user is already a member
    const { data: existingMembership, error: membershipCheckError } = await supabase
      .from('class_memberships')
      .select('id')
      .eq('class_id', classData.id)
      .eq('user_id', user.id)
      .single();

    if (existingMembership) {
      throw new Error('Already member of this class');
    }

    if (membershipCheckError && membershipCheckError.code !== 'PGRST116') {
      throw membershipCheckError;
    }

    // Create membership
    const { data, error } = await supabase
      .from('class_memberships')
      .insert({
        class_id: classData.id,
        user_id: user.id,
        starting_balance: 100000,
        joined_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    // Return membership with class details
    return { 
      data: {
        ...data,
        class: classData
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error joining class:', error);
    return { data: null, error };
  }
};

/**
 * Get user's class memberships
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} List of class memberships with class details
 */
export const getUserClassMemberships = async (userId = null) => {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated');
      }
      
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select(`
        *,
        classes (
          id,
          name,
          semester,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', targetUserId)
      .order('joined_at', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting user class memberships:', error);
    return { data: null, error };
  }
};

/**
 * Get class members
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} List of class members with user details
 */
export const getClassMembers = async (classId) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('class_memberships')
      .select(`
        *,
        users:user_id (
          id,
          email
        )
      `)
      .eq('class_id', classId)
      .order('joined_at');

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting class members:', error);
    return { data: null, error };
  }
};

/**
 * Check if user is member of a class
 * @param {string} classId - Class ID
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} Membership status
 */
export const isUserMemberOfClass = async (classId, userId = null) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated');
      }
      
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select('id, joined_at')
      .eq('class_id', classId)
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: { isMember: false, membership: null }, error: null };
      }
      throw error;
    }

    return { 
      data: { 
        isMember: true, 
        membership: data 
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking class membership:', error);
    return { data: null, error };
  }
};

/**
 * Get class leaderboard
 * @param {string} classId - Class ID
 * @returns {Promise<Object>} Class leaderboard with rankings
 */
export const getClassLeaderboard = async (classId) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  try {
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .eq('class_id', classId)
      .order('rank');

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting class leaderboard:', error);
    return { data: null, error };
  }
};

/**
 * Get user's active classes (classes that are currently running)
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} List of active class memberships
 */
export const getUserActiveClasses = async (userId = null) => {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated');
      }
      
      targetUserId = user.id;
    }

    const { data, error } = await supabase
      .from('class_memberships')
      .select(`
        *,
        classes!inner (
          id,
          name,
          semester,
          start_date,
          end_date,
          is_active
        )
      `)
      .eq('user_id', targetUserId)
      .eq('classes.is_active', true)
      .order('classes.start_date', { ascending: false });

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting user active classes:', error);
    return { data: null, error };
  }
};

/**
 * Leave a class
 * @param {string} classId - Class ID to leave
 * @returns {Promise<Object>} Success/error response
 */
export const leaveClass = async (classId) => {
  if (!classId) {
    throw new Error('Class ID is required');
  }

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated');
    }

    // Note: Based on business rules, students typically can't leave classes
    // This function exists for completeness but may be restricted
    throw new Error('Leaving classes is not allowed');
    
    // If leaving was allowed, code would be:
    // const { error } = await supabase
    //   .from('class_memberships')
    //   .delete()
    //   .eq('class_id', classId)
    //   .eq('user_id', user.id);
    
    // return { error };
  } catch (error) {
    console.error('Error leaving class:', error);
    return { error };
  }
};