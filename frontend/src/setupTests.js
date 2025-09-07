import '@testing-library/jest-dom'

// Mock environment variables
global.process.env = {
  ...process.env,
  VITE_SUPABASE_URL: 'https://test.supabase.co',
  VITE_SUPABASE_ANON_KEY: 'test-anon-key'
}