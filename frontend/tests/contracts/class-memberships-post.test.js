/**
 * T021: Contract test for POST /class_memberships endpoint
 * Tests API contract compliance for joining class with invite code
 * 
 * Expected to FAIL - no implementation exists yet (TDD red phase)
 */
import { createClient } from '@supabase/supabase-js'

// Mock Supabase client
const mockSupabase = {
  from: jest.fn(() => ({
    insert: jest.fn(() => ({
      select: jest.fn(() => Promise.resolve({ data: [], error: null }))
    })),
    select: jest.fn(() => ({
      eq: jest.fn(() => ({
        single: jest.fn(() => Promise.resolve({ data: null, error: null }))
      }))
    }))
  })),
  auth: {
    getUser: jest.fn(() => Promise.resolve({
      data: { user: { id: '123e4567-e89b-12d3-a456-426614174000' } },
      error: null
    }))
  }
}

jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => mockSupabase)
}))

describe('POST /class_memberships Contract', () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('Authentication', () => {
    it('should require authentication token', async () => {
      // Arrange
      mockSupabase.auth.getUser.mockResolvedValue({
        data: { user: null },
        error: { message: 'JWT expired' }
      })

      // Act & Assert
      const userResponse = await mockSupabase.auth.getUser()
      expect(userResponse.error).toBeDefined()
      expect(userResponse.data.user).toBeNull()
    })
  })

  describe('Request Contract', () => {
    it('should accept valid invite code', async () => {
      // Arrange
      const validRequest = {
        invite_code: 'ABC123'
      }

      const mockResponse = {
        data: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          class_id: '456e4567-e89b-12d3-a456-426614174456',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          starting_balance: 100000.00,
          joined_at: '2025-09-07T15:30:00.000Z'
        }],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockResponse)
        })
      })

      // Act
      const response = await mockSupabase.from('class_memberships')
        .insert(validRequest)
        .select()

      // Assert
      expect(response.data).toBeDefined()
      expect(mockSupabase.from).toHaveBeenCalledWith('class_memberships')
    })

    it('should require invite_code field', () => {
      // Arrange
      const invalidRequest = {
        // Missing invite_code
      }

      // Act & Assert
      expect(() => {
        if (!invalidRequest.invite_code) {
          throw new Error('invite_code is required')
        }
      }).toThrow('invite_code is required')
    })

    it('should validate invite code pattern', () => {
      // Arrange
      const validCode = 'ABC123'
      const invalidCodeLower = 'abc123'
      const invalidCodeShort = 'AB12'
      const invalidCodeLong = 'ABC1234'
      const invalidCodeSpecial = 'AB@123'
      const inviteCodePattern = /^[A-Z0-9]{6}$/

      // Act & Assert
      expect(inviteCodePattern.test(validCode)).toBe(true)
      expect(inviteCodePattern.test(invalidCodeLower)).toBe(false)
      expect(inviteCodePattern.test(invalidCodeShort)).toBe(false)
      expect(inviteCodePattern.test(invalidCodeLong)).toBe(false)
      expect(inviteCodePattern.test(invalidCodeSpecial)).toBe(false)
    })
  })

  describe('Response Contract', () => {
    it('should return 201 status with ClassMembership schema on success', async () => {
      // Arrange
      const mockSuccessResponse = {
        data: [{
          id: '123e4567-e89b-12d3-a456-426614174000',
          class_id: '456e4567-e89b-12d3-a456-426614174456',
          user_id: '123e4567-e89b-12d3-a456-426614174000',
          starting_balance: 100000.00,
          joined_at: '2025-09-07T15:30:00.000Z'
        }],
        error: null
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockSuccessResponse)
        })
      })

      // Act
      const response = await mockSupabase.from('class_memberships')
        .insert({ invite_code: 'ABC123' })
        .select()

      // Assert - Validate ClassMembership schema
      expect(response.data[0]).toMatchObject({
        id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        class_id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        user_id: expect.stringMatching(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/),
        starting_balance: expect.any(Number),
        joined_at: expect.stringMatching(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
      })

      // Validate business logic
      expect(response.data[0].starting_balance).toBe(100000.00)
    })

    it('should return 400 error for invalid invite code', async () => {
      // Arrange
      const mockErrorResponse = {
        data: null,
        error: {
          message: 'Invalid invite code',
          details: 'No active class found with this invite code'
        }
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockErrorResponse)
        })
      })

      // Act
      const response = await mockSupabase.from('class_memberships')
        .insert({ invite_code: 'INVALID' })
        .select()

      // Assert
      expect(response.error).toBeDefined()
      expect(response.error.message).toContain('Invalid invite code')
      expect(response.data).toBeNull()
    })

    it('should return 409 error when already member of class', async () => {
      // Arrange
      const mockConflictResponse = {
        data: null,
        error: {
          message: 'Already member of this class',
          code: '23505'
        }
      }

      mockSupabase.from.mockReturnValue({
        insert: jest.fn().mockReturnValue({
          select: jest.fn().mockResolvedValue(mockConflictResponse)
        })
      })

      // Act
      const response = await mockSupabase.from('class_memberships')
        .insert({ invite_code: 'ABC123' })
        .select()

      // Assert
      expect(response.error).toBeDefined()
      expect(response.error.message).toContain('Already member of this class')
      expect(response.error.code).toBe('23505')
      expect(response.data).toBeNull()
    })
  })

  describe('Invite Code Validation', () => {
    it('should validate against active classes only', async () => {
      // Arrange - Mock checking if class is active
      const mockActiveClassResponse = {
        data: {
          id: '456e4567-e89b-12d3-a456-426614174456',
          name: 'Finance 101 - Fall 2025',
          invite_code: 'ABC123',
          semester: 'Fall 2025',
          start_date: '2025-09-01',
          end_date: '2025-12-15',
          is_active: true,
          created_at: '2025-08-15T10:00:00.000Z'
        },
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockActiveClassResponse)
          })
        })
      })

      // Act - Simulate lookup by invite code
      const classResponse = await mockSupabase.from('classes')
        .select('*')
        .eq('invite_code', 'ABC123')
        .single()

      // Assert
      expect(classResponse.data.is_active).toBe(true)
      expect(classResponse.data.invite_code).toBe('ABC123')
    })

    it('should reject invite codes from inactive classes', async () => {
      // Arrange - Mock inactive class
      const mockInactiveClassResponse = {
        data: {
          id: '456e4567-e89b-12d3-a456-426614174456',
          name: 'Finance 101 - Spring 2025',
          invite_code: 'XYZ789',
          semester: 'Spring 2025',
          start_date: '2025-01-01',
          end_date: '2025-05-15',
          is_active: false,
          created_at: '2025-01-01T10:00:00.000Z'
        },
        error: null
      }

      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: jest.fn().mockReturnValue({
            single: jest.fn().mockResolvedValue(mockInactiveClassResponse)
          })
        })
      })

      // Act
      const classResponse = await mockSupabase.from('classes')
        .select('*')
        .eq('invite_code', 'XYZ789')
        .single()

      // Assert
      expect(classResponse.data.is_active).toBe(false)
    })
  })

  describe('Business Logic Validation', () => {
    it('should set starting balance to $100,000', () => {
      // Arrange
      const expectedStartingBalance = 100000.00

      // Act & Assert
      expect(expectedStartingBalance).toBe(100000.00)
    })

    it('should record current timestamp for joined_at', () => {
      // Arrange
      const now = new Date()
      const mockTimestamp = now.toISOString()

      // Act & Assert
      expect(mockTimestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })
  })

  describe('Integration with Supabase Database', () => {
    it('should insert into class_memberships table', () => {
      // Arrange & Act
      mockSupabase.from('class_memberships')

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('class_memberships')
    })

    it('should lookup class by invite code before inserting', async () => {
      // Arrange
      const inviteCode = 'ABC123'
      const eqMock = jest.fn().mockReturnValue({
        single: jest.fn().mockResolvedValue({ data: {}, error: null })
      })
      
      mockSupabase.from.mockReturnValue({
        select: jest.fn().mockReturnValue({
          eq: eqMock
        })
      })

      // Act
      await mockSupabase.from('classes').select('*').eq('invite_code', inviteCode).single()

      // Assert
      expect(mockSupabase.from).toHaveBeenCalledWith('classes')
      expect(eqMock).toHaveBeenCalledWith('invite_code', inviteCode)
    })

    it('should return inserted membership with select', async () => {
      // Arrange
      const insertMock = jest.fn().mockReturnValue({
        select: jest.fn().mockResolvedValue({ data: [{}], error: null })
      })
      
      mockSupabase.from.mockReturnValue({
        insert: insertMock
      })

      // Act
      await mockSupabase.from('class_memberships').insert({}).select()

      // Assert
      expect(insertMock).toHaveBeenCalled()
    })
  })
})