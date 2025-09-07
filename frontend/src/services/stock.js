import { supabase } from '../lib/supabase.js';

/**
 * Stock service for the Stock Trading Learning Platform
 * Handles stock price data, TSX integration, and Alpha Vantage API calls
 */

const ALPHA_VANTAGE_API_KEY = import.meta.env.VITE_ALPHA_VANTAGE_API_KEY;
const ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query';

/**
 * Fetch all available TSX stocks from database
 * @param {Object} options - Query options
 * @param {string} options.symbol - Filter by symbol (partial match)
 * @param {number} options.limit - Limit results (default: 100)
 * @returns {Promise<Object>} List of stocks with current prices
 */
export const getStockPrices = async ({ symbol = '', limit = 100 } = {}) => {
  try {
    let query = supabase
      .from('stock_prices')
      .select('*')
      .order('company_name');

    if (symbol) {
      query = query.ilike('symbol', `%${symbol}%`);
    }

    if (limit) {
      query = query.limit(limit);
    }

    const { data, error } = await query;

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stock prices:', error);
    return { data: null, error };
  }
};

/**
 * Get current price for specific stock
 * @param {string} symbol - TSX stock symbol (e.g., 'SHOP.TO')
 * @returns {Promise<Object>} Stock price details
 */
export const getStockPrice = async (symbol) => {
  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  // Ensure symbol has .TO suffix for TSX
  const tsxSymbol = symbol.endsWith('.TO') ? symbol : `${symbol}.TO`;

  try {
    const { data, error } = await supabase
      .from('stock_prices')
      .select('*')
      .eq('symbol', tsxSymbol)
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error fetching stock price:', error);
    return { data: null, error };
  }
};

/**
 * Fetch real-time stock data from Alpha Vantage API
 * @param {string} symbol - Stock symbol (TSX format)
 * @returns {Promise<Object>} Real-time stock data
 */
export const fetchRealTimeStockData = async (symbol) => {
  if (!ALPHA_VANTAGE_API_KEY) {
    throw new Error('Alpha Vantage API key is not configured');
  }

  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  // Remove .TO suffix for Alpha Vantage API call
  const apiSymbol = symbol.replace('.TO', '');

  try {
    const url = new URL(ALPHA_VANTAGE_BASE_URL);
    url.searchParams.append('function', 'GLOBAL_QUOTE');
    url.searchParams.append('symbol', `${apiSymbol}.TRT`); // Toronto Stock Exchange
    url.searchParams.append('apikey', ALPHA_VANTAGE_API_KEY);

    const response = await fetch(url.toString());
    
    if (!response.ok) {
      throw new Error(`Alpha Vantage API error: ${response.statusText}`);
    }

    const data = await response.json();

    // Check for API error response
    if (data['Error Message']) {
      throw new Error(data['Error Message']);
    }

    if (data['Note']) {
      throw new Error('API call frequency limit reached');
    }

    const quote = data['Global Quote'];
    
    if (!quote || !quote['05. price']) {
      throw new Error('Invalid response from Alpha Vantage API');
    }

    // Transform Alpha Vantage response to our format
    const stockData = {
      symbol: symbol, // Keep our TSX format
      current_price: parseFloat(quote['05. price']),
      previous_close: parseFloat(quote['08. previous close']),
      day_change: parseFloat(quote['09. change']),
      day_change_percent: parseFloat(quote['10. change percent'].replace('%', '')),
      last_updated: new Date().toISOString(),
      market_status: 'open' // Alpha Vantage doesn't provide this directly
    };

    return { data: stockData, error: null };
  } catch (error) {
    console.error('Error fetching real-time stock data:', error);
    return { data: null, error };
  }
};

/**
 * Update stock price in database (cache)
 * @param {string} symbol - TSX stock symbol
 * @param {Object} stockData - Stock data to update
 * @returns {Promise<Object>} Updated stock price record
 */
export const updateStockPrice = async (symbol, stockData) => {
  if (!symbol || !stockData) {
    throw new Error('Symbol and stock data are required');
  }

  try {
    const { data, error } = await supabase
      .from('stock_prices')
      .upsert({
        symbol,
        ...stockData,
        last_updated: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error updating stock price:', error);
    return { data: null, error };
  }
};

/**
 * Get fresh stock price (from API if cache is stale, otherwise from DB)
 * @param {string} symbol - TSX stock symbol
 * @param {boolean} forceRefresh - Force fetch from API regardless of cache age
 * @returns {Promise<Object>} Current stock price data
 */
export const getFreshStockPrice = async (symbol, forceRefresh = false) => {
  if (!symbol) {
    throw new Error('Stock symbol is required');
  }

  const tsxSymbol = symbol.endsWith('.TO') ? symbol : `${symbol}.TO`;

  try {
    // First, try to get from database
    const { data: cachedData, error: dbError } = await getStockPrice(tsxSymbol);
    
    // Check if we should refresh the cache
    const shouldRefresh = forceRefresh || 
                         !cachedData || 
                         !cachedData.last_updated ||
                         (new Date() - new Date(cachedData.last_updated)) > 15 * 60 * 1000; // 15 minutes

    if (!shouldRefresh && cachedData) {
      return { data: cachedData, error: null };
    }

    // Fetch fresh data from Alpha Vantage
    const { data: freshData, error: apiError } = await fetchRealTimeStockData(tsxSymbol);
    
    if (apiError) {
      // If API fails, return cached data if available
      if (cachedData) {
        console.warn('API failed, returning cached data:', apiError);
        return { data: cachedData, error: null };
      }
      throw apiError;
    }

    // Update cache with fresh data
    const { data: updatedData, error: updateError } = await updateStockPrice(tsxSymbol, freshData);
    
    if (updateError) {
      console.warn('Failed to update cache, returning API data:', updateError);
      return { data: freshData, error: null };
    }

    return { data: updatedData, error: null };
  } catch (error) {
    console.error('Error getting fresh stock price:', error);
    return { data: null, error };
  }
};

/**
 * Search for stocks by name or symbol
 * @param {string} query - Search query
 * @param {number} limit - Maximum results to return
 * @returns {Promise<Object>} Matching stocks
 */
export const searchStocks = async (query, limit = 20) => {
  if (!query || query.length < 2) {
    return { data: [], error: null };
  }

  try {
    const { data, error } = await supabase
      .from('stock_prices')
      .select('*')
      .or(`symbol.ilike.%${query}%,company_name.ilike.%${query}%`)
      .order('company_name')
      .limit(limit);

    if (error) {
      throw error;
    }

    return { data, error: null };
  } catch (error) {
    console.error('Error searching stocks:', error);
    return { data: null, error };
  }
};

/**
 * Calculate investment details for a given stock and amount
 * @param {string} symbol - TSX stock symbol
 * @param {number} amount - Investment amount (default: 100000)
 * @returns {Promise<Object>} Investment calculation
 */
export const calculateInvestment = async (symbol, amount = 100000) => {
  if (!symbol || amount <= 0) {
    throw new Error('Valid symbol and positive amount are required');
  }

  try {
    // Get current stock price
    const { data: stockData, error: stockError } = await getFreshStockPrice(symbol);
    
    if (stockError || !stockData) {
      throw stockError || new Error('Stock not found');
    }

    const currentPrice = stockData.current_price;
    const sharesPurchasable = Math.floor(amount / currentPrice);
    const totalCost = sharesPurchasable * currentPrice;
    const remainingFunds = amount - totalCost;

    const calculation = {
      stock_symbol: symbol,
      current_price: currentPrice,
      available_funds: amount,
      shares_purchasable: sharesPurchasable,
      total_cost: totalCost,
      remaining_funds: remainingFunds
    };

    return { data: calculation, error: null };
  } catch (error) {
    console.error('Error calculating investment:', error);
    return { data: null, error };
  }
};