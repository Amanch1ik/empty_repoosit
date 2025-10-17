import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest'
import axios from 'axios'
import AuthService from './AuthService'

describe('AuthService', () => {
  const mockUser = {
    username: 'testuser',
    email: 'test@example.com',
    token: 'fake_token_123'
  }

  beforeEach(() => {
    localStorage.clear()
    vi.resetAllMocks()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('should login successfully', async () => {
    const loginData = { username: 'testuser', password: 'password123' }
    
    vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'fake_token_123'
      }
    })

    const result = await AuthService.login(loginData)

    expect(result).toEqual(mockUser)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    expect(localStorage.getItem('token')).toBe('fake_token_123')
  })

  it('should handle login failure', async () => {
    const loginData = { username: 'testuser', password: 'wrongpassword' }
    
    vi.spyOn(axios, 'post').mockRejectedValue(new Error('Invalid credentials'))

    await expect(AuthService.login(loginData)).rejects.toThrow('Invalid credentials')
    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should logout user', () => {
    localStorage.setItem('user', JSON.stringify(mockUser))
    localStorage.setItem('token', 'fake_token_123')

    AuthService.logout()

    expect(localStorage.getItem('user')).toBeNull()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('should register user successfully', async () => {
    const registrationData = {
      username: 'newuser',
      email: 'newuser@example.com',
      password: 'password123'
    }

    vi.spyOn(axios, 'post').mockResolvedValue({
      data: {
        user: mockUser,
        access_token: 'fake_token_123'
      }
    })

    const result = await AuthService.register(registrationData)

    expect(result).toEqual(mockUser)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(mockUser))
    expect(localStorage.getItem('token')).toBe('fake_token_123')
  })

  it('should get current user from localStorage', () => {
    localStorage.setItem('user', JSON.stringify(mockUser))

    const currentUser = AuthService.getCurrentUser()

    expect(currentUser).toEqual(mockUser)
  })

  it('should return null if no user in localStorage', () => {
    const currentUser = AuthService.getCurrentUser()

    expect(currentUser).toBeNull()
  })
})
