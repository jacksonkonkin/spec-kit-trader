import { supabase } from '../lib/supabase.js';
import { getFreshStockPrice, calculateInvestment } from './stock.js';

/**
 * Portfolio service for the Stock Trading Learning Platform
 * Handles portfolio creation, retrieval, and performance tracking
 */

/**
 * Create a new portfolio with stock investment
 * @param {Object} investment - Investment details
 * @param {string} investment.stock_symbol - TSX stock symbol (e.g., 'SHOP.TO')
 * @param {number} investment.shares - Number of shares to purchase
 * @returns {Promise<Object>} Created portfolio
 */
export const createPortfolio = async ({ stock_symbol, shares }) => {
  if (!stock_symbol || !shares || shares <= 0) {
    throw new Error('Valid stock symbol and positive shares are required');
  }

  // Ensure symbol has .TO suffix
  const tsxSymbol = stock_symbol.endsWith('.TO') ? stock_symbol : `${stock_symbol}.TO`;

  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      throw new Error('User must be authenticated');
    }

    // Check if user already has a portfolio
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (existingPortfolio) {
      throw new Error('User already has a portfolio');
    }

    // Get current stock price
    const { data: stockData, error: stockError } = await getFreshStockPrice(tsxSymbol);
    
    if (stockError || !stockData) {
      throw stockError || new Error('Stock not found');
    }

    const purchasePrice = stockData.current_price;
    const totalCost = shares * purchasePrice;
    
    // Validate investment doesn't exceed $100,000
    if (totalCost > 100000) {
      throw new Error('Investment exceeds available funds of $100,000');
    }

    // Create portfolio
    const { data, error } = await supabase
      .from('portfolios')
      .insert({
        user_id: user.id,
        stock_symbol: tsxSymbol,
        purchase_price: purchasePrice,
        shares: shares,
        initial_value: 100000,
        purchase_date: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error creating portfolio:', error);
    return { data: null, error };
  }
};

/**
 * Get user's portfolio
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} Portfolio with current performance
 */
export const getPortfolio = async (userId = null) => {
  try {
    let targetUserId = userId;

    // If no userId provided, get current user
    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated');
      }
      
      targetUserId = user.id;
    }

    // Get portfolio with performance data using the view
    const { data, error } = await supabase
      .from('portfolio_performance_view')
      .select('*')
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No portfolio found
        return { data: null, error: { message: 'No portfolio found', code: 'NO_PORTFOLIO' } };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting portfolio:', error);
    return { data: null, error };
  }
};

/**
 * Get portfolio by specific user ID (public access)
 * @param {string} userId - Target user ID
 * @returns {Promise<Object>} Portfolio with current performance
 */
export const getPortfolioByUserId = async (userId) => {
  if (!userId) {
    throw new Error('User ID is required');
  }

  return await getPortfolio(userId);
};

/**
 * Get all portfolios for leaderboard
 * @param {string} classId - Class ID to filter by (optional)
 * @returns {Promise<Object>} List of portfolios with performance and rankings
 */
export const getLeaderboard = async (classId = null) => {
  try {
    let query = supabase
      .from('leaderboard_view')
      .select('*')
      .order('rank');

    if (classId) {
      query = query.eq('class_id', classId);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting leaderboard:', error);
    return { data: null, error };
  }
};

/**
 * Get portfolio performance history
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} Portfolio performance over time
 */
export const getPortfolioPerformance = async (userId = null) => {
  try {
    let targetUserId = userId;

    if (!targetUserId) {
      const { data: { user }, error: userError } = await supabase.auth.getUser();
      
      if (userError || !user) {
        throw new Error('User must be authenticated');
      }
      
      targetUserId = user.id;
    }

    // Get current portfolio performance
    const { data: portfolio, error: portfolioError } = await getPortfolio(targetUserId);
    
    if (portfolioError) {
      throw portfolioError;
    }

    if (!portfolio) {
      return { data: null, error: { message: 'No portfolio found', code: 'NO_PORTFOLIO' } };
    }

    // Calculate performance metrics
    const performance = {
      user_id: portfolio.user_id,
      stock_symbol: portfolio.stock_symbol,
      company_name: portfolio.company_name,
      purchase_date: portfolio.purchase_date,
      purchase_price: portfolio.purchase_price,
      shares: portfolio.shares,
      initial_value: portfolio.initial_value,
      current_price: portfolio.current_price,
      current_value: portfolio.current_value,
      total_return: portfolio.total_return,
      return_percentage: portfolio.return_percentage,
      market_status: portfolio.market_status,
      last_updated: portfolio.last_updated,
      days_held: Math.floor((new Date() - new Date(portfolio.purchase_date)) / (1000 * 60 * 60 * 24))
    };

    return { data: performance, error: null };
  } catch (error) {
    console.error('Error getting portfolio performance:', error);
    return { data: null, error };
  }
};

/**
 * Calculate potential investment for a stock
 * @param {string} stockSymbol - Stock symbol to analyze
 * @param {number} amount - Investment amount (default: 100000)
 * @returns {Promise<Object>} Investment analysis
 */
export const calculatePotentialInvestment = async (stockSymbol, amount = 100000) => {
  try {
    const { data, error } = await calculateInvestment(stockSymbol, amount);
    
    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error calculating potential investment:', error);
    return { data: null, error };
  }
};

/**
 * Check if user can create a portfolio
 * @returns {Promise<Object>} Eligibility check result
 */
export const canCreatePortfolio = async () => {
  try {
    // Get current user
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    
    if (userError || !user) {
      return { 
        data: { 
          canCreate: false, 
          reason: 'User must be authenticated' 
        }, 
        error: null 
      };
    }

    // Check if user already has a portfolio
    const { data: existingPortfolio, error: checkError } = await supabase
      .from('portfolios')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    const canCreate = !existingPortfolio;
    const reason = existingPortfolio ? 'User already has a portfolio' : null;

    return { 
      data: { 
        canCreate, 
        reason,
        hasPortfolio: !!existingPortfolio
      }, 
      error: null 
    };
  } catch (error) {
    console.error('Error checking portfolio eligibility:', error);
    return { data: null, error };
  }
};

/**
 * Get user's current rank in class
 * @param {string} classId - Class ID
 * @param {string} userId - User ID (optional, defaults to current user)
 * @returns {Promise<Object>} User's rank and performance in class
 */
export const getUserRankInClass = async (classId, userId = null) => {
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

    // Get user's rank from leaderboard view
    const { data, error } = await supabase
      .from('leaderboard_view')
      .select('*')
      .eq('class_id', classId)
      .eq('user_id', targetUserId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return { data: null, error: { message: 'User not found in class leaderboard', code: 'NO_RANK' } };
      }
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error getting user rank:', error);
    return { data: null, error };
  }
};