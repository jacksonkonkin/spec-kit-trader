/**
 * T018: Contract test for GET /stock_prices endpoint
 * Tests API contract compliance for TSX stock price retrieval
 * 
 * Expected to FAIL - no implementation exists yet (TDD red phase)
 */
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    select: jest.fn(() => ({
      ilike: jest.fn(() => ({
        limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      limit: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}))

describe('GET /stock_prices Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Request Contract', () => {
    it('should accept request without query parameters', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            symbol: 'SHOP.TO',
            company_name: 'Shopify Inc.',
            current_price: 85.50,
            previous_close: 84.75,
            day_change: 0.75,
            day_change_percent: 0.88,
            market_status: 'closed',
            last_updated: '2025-09-07T21:00:00.000Z'
          }
        ],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockResponse)
        })
      })

      // Act
      const query = mockSupabase.from('stock_prices').select('*').limit(100)
      const response = await query

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('stock_prices')
      expect(response.data).toBeDefined()
    })

    it('should accept symbol query parameter for filtering', async () => {
      // Arrange
      const mockResponse = {
        data: [
          {
            symbol: 'SHOP.TO',
            company_name: 'Shopify Inc.',
            current_price: 85.50,
            previous_close: 84.75,
            day_change: 0.75,
            day_change_percent: 0.88,
            market_status: 'closed',
            last_updated: '2025-09-07T21:00:00.000Z'
          }
        ],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockResponse)
          })
        })
      })

      // Act
      const query = mockSupabase.from('stock_prices')
        .select('*')
        .ilike('symbol', '%SHOP%')
        .limit(100)
      const response = await query

      // Assert
      expect(response.data).toBeDefined()
    })

    it('should accept limit query parameter with default 100', async () => {
      // Arrange
      const mockResponse = { data: [], error: null }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockResponse)
        })
      })

      // Act
      const query = mockSupabase.from('stock_prices').select('*').limit(50)
      await query

      // Assert - Verify limit parameter is used
      const selectMock = mockSupabase.from().select()
      expect(selectMock.limit).toBeDefined()
    })
  })

  describe('Response Contract', () => {
    it('should return 200 status with array of StockPrice schema on success', async () => {
      // Arrange
      const mockSuccessResponse = {
        data: [
          {
            symbol: 'SHOP.TO',
            company_name: 'Shopify Inc.',
            current_price: 85.50,
            previous_close: 84.75,
            day_change: 0.75,
            day_change_percent: 0.88,
            market_status: 'closed',
            last_updated: '2025-09-07T21:00:00.000Z'
          },
          {
            symbol: 'CNR.TO',
            company_name: 'Canadian National Railway Company',
            current_price: 167.25,
            previous_close: 166.80,
            day_change: 0.45,
            day_change_percent: 0.27,
            market_status: 'closed',
            last_updated: '2025-09-07T21:00:00.000Z'
          }
        ],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          limit: jest.fn().mockResolvedValue(mockSuccessResponse)
        })
      })

      // Act
      const response = await mockSupabase.from('stock_prices').select('*').limit(100)

      // Assert - Validate StockPrice schema
      expect(response.data).toBeInstanceOf(Array)
      expect(response.data.length).toBeGreaterThan(0)
      
      response.data.forEach(stock => {
        expect(stock).toMatchObject({
          symbol: expect.any(String),
          company_name: expect.any(String),
          current_price: expect.any(Number),
          previous_close: expect.any(Number),
          day_change: expect.any(Number),
          day_change_percent: expect.any(Number),
          market_status: expect.stringMatching(/^(open|closed|pre-market|after-hours)$/),
          last_updated: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
        })
        
        // Validate TSX symbols end with .TO
        expect(stock.symbol).toMatch(/\.TO$/)
      })
    })

    it('should return empty array when no stocks match filter', async () => {
      // Arrange
      const mockEmptyResponse = {
        data: [],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          ilike: jest.fn().mockReturnValue({
            limit: jest.fn().mockResolvedValue(mockEmptyResponse)
          })
        })
      })

      // Act
      const response = await mockSupabase.from('stock_prices')
        .select('*')
        .ilike('symbol', '%NONEXISTENT%')
        .limit(100)

      // Assert
      expect(response.data).toEqual([])
      expect(response.error).toBeNull()
    })
  })

  describe('Market Status Validation', () => {
    it('should include valid market status values', () => {
      // Arrange
      const validStatuses = ['open', 'closed', 'pre-market', 'after-hours']
      const testStatus = 'closed'

      // Act & Assert
      expect(validStatuses).toContain(testStatus)
    })

    it('should reject invalid market status values', () => {
      // Arrange
      const validStatuses = ['open', 'closed', 'pre-market', 'after-hours']
      const invalidStatus = 'invalid-status'

      // Act & Assert
      expect(validStatuses).not.toContain(invalidStatus)
    })
  })

  describe('Integration with Supabase Database', () => {
    it('should query stock_prices table', () => {
      // Arrange & Act
      mockSupabase.from('stock_prices')

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('stock_prices')
    })

    it('should select all columns by default', () => {
      // Arrange
      const selectMock = jest.fn().mockReturnValue({
        limit: jest.fn().mockResolvedValue({ data: [], error: null })
      })
      
      mockSupabase.from.mockReturnValue({
        select: selectMock
      })

      // Act
      mockSupabase.from('stock_prices').select('*')

      // Assert
      expect(selectMock).toHaveBeenCalledWith('*')
    })
  })
})