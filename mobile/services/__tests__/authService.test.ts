import { login, register, requestOtp, verifyOtp, resetPassword, fetchProfile, logout } from '../authService';
import { apiClient, toApiError } from '../api';
import { setToken, clearToken } from '../tokenStorage';
import type { AuthResponse, LoginPayload, RegisterPayload } from '../authService';

// Mock dependencies
jest.mock('../api', () => ({
  apiClient: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  toApiError: jest.fn((error) => error),
}));
jest.mock('../tokenStorage');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;
const mockSetToken = setToken as jest.MockedFunction<typeof setToken>;
const mockClearToken = clearToken as jest.MockedFunction<typeof clearToken>;

describe('authService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // ✅ Test Group 1: Login
  // จากโค้ดจริง: login() function
  // ==========================================

  describe('login', () => {
    it('should login successfully with email and password', async () => {
      const payload: LoginPayload = {
        identifier: 'user@example.com',
        password: 'password123',
      };

      const mockResponse: AuthResponse = {
        token: 'mock-jwt-token',
        user: {
          id: '1',
          email: 'user@example.com',
          firstName: 'John',
          lastName: 'Doe',
          role: 'CAREGIVER',
          phone: '0812345678',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Login successful',
          data: mockResponse,
        },
      });

      const result = await login(payload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/login', payload);
      expect(mockSetToken).toHaveBeenCalledWith('mock-jwt-token');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when login fails', async () => {
      const payload: LoginPayload = {
        identifier: 'wrong@example.com',
        password: 'wrongpassword',
      };

      mockApiClient.post.mockRejectedValueOnce({
        status: 401,
        message: 'Invalid credentials',
      });

      await expect(login(payload)).rejects.toMatchObject({
        status: 401,
        message: 'Invalid credentials',
      });
      expect(mockSetToken).not.toHaveBeenCalled();
    });

    it('should handle network errors', async () => {
      const payload: LoginPayload = {
        identifier: 'user@example.com',
        password: 'password123',
      };

      mockApiClient.post.mockRejectedValueOnce({
        message: 'Network error',
      });

      await expect(login(payload)).rejects.toMatchObject({
        message: 'Network error',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 2: Register
  // จากโค้ดจริง: register() function
  // ==========================================

  describe('register', () => {
    it('should register new user successfully', async () => {
      const payload: RegisterPayload = {
        email: 'newuser@example.com',
        password: 'password123',
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0898765432',
      };

      const mockResponse: AuthResponse = {
        token: 'new-user-token',
        user: {
          id: '2',
          email: 'newuser@example.com',
          firstName: 'Jane',
          lastName: 'Smith',
          role: 'CAREGIVER',
          phone: '0898765432',
        },
      };

      mockApiClient.post.mockResolvedValueOnce({
        data: {
          success: true,
          message: 'Registration successful',
          data: mockResponse,
        },
      });

      const result = await register(payload);

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/register', payload);
      expect(mockSetToken).toHaveBeenCalledWith('new-user-token');
      expect(result).toEqual(mockResponse);
    });

    it('should throw error when email already exists', async () => {
      const payload: RegisterPayload = {
        email: 'existing@example.com',
        password: 'password123',
        firstName: 'Test',
        lastName: 'User',
      };

      mockApiClient.post.mockRejectedValueOnce({
        status: 409,
        message: 'Email already in use',
      });

      await expect(register(payload)).rejects.toMatchObject({
        status: 409,
        message: 'Email already in use',
      });
      expect(mockSetToken).not.toHaveBeenCalled();
    });
  });

  // ==========================================
  // ✅ Test Group 3: OTP Operations
  // จากโค้ดจริง: requestOtp(), verifyOtp()
  // ==========================================

  describe('requestOtp', () => {
    it('should request OTP successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await requestOtp({
        email: 'user@example.com',
        purpose: 'PASSWORD_RESET',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/request-otp', {
        email: 'user@example.com',
        purpose: 'PASSWORD_RESET',
      });
    });

    it('should handle OTP request errors', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        status: 404,
        message: 'Email not found',
      });

      await expect(
        requestOtp({
          email: 'notfound@example.com',
          purpose: 'PASSWORD_RESET',
        })
      ).rejects.toMatchObject({
        status: 404,
        message: 'Email not found',
      });
    });
  });

  describe('verifyOtp', () => {
    it('should verify OTP successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await verifyOtp({
        email: 'user@example.com',
        code: '123456',
        purpose: 'PASSWORD_RESET',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/verify-otp', {
        email: 'user@example.com',
        code: '123456',
        purpose: 'PASSWORD_RESET',
      });
    });

    it('should throw error when OTP is invalid', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        status: 400,
        message: 'Invalid OTP code',
      });

      await expect(
        verifyOtp({
          email: 'user@example.com',
          code: 'wrong',
          purpose: 'PASSWORD_RESET',
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Invalid OTP code',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 4: Password Reset
  // จากโค้ดจริง: resetPassword() function
  // ==========================================

  describe('resetPassword', () => {
    it('should reset password successfully', async () => {
      mockApiClient.post.mockResolvedValueOnce({ data: { success: true } });

      await resetPassword({
        email: 'user@example.com',
        code: '123456',
        newPassword: 'newPassword123',
      });

      expect(mockApiClient.post).toHaveBeenCalledWith('/api/auth/reset-password', {
        email: 'user@example.com',
        code: '123456',
        newPassword: 'newPassword123',
      });
    });

    it('should throw error when reset fails', async () => {
      mockApiClient.post.mockRejectedValueOnce({
        status: 400,
        message: 'Invalid or expired code',
      });

      await expect(
        resetPassword({
          email: 'user@example.com',
          code: 'expired',
          newPassword: 'newPassword123',
        })
      ).rejects.toMatchObject({
        status: 400,
        message: 'Invalid or expired code',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 5: Profile Operations
  // จากโค้ดจริง: fetchProfile(), logout()
  // ==========================================

  describe('fetchProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CAREGIVER' as const,
        phone: '0812345678',
      };

      mockApiClient.get.mockResolvedValueOnce({ data: mockProfile });

      const result = await fetchProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/auth/me');
      expect(result).toEqual(mockProfile);
    });

    it('should throw error when unauthorized', async () => {
      mockApiClient.get.mockRejectedValueOnce({
        status: 401,
        message: 'Unauthorized',
      });

      await expect(fetchProfile()).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });
  });

  describe('logout', () => {
    it('should logout and clear token', async () => {
      mockClearToken.mockResolvedValueOnce(undefined);

      await logout();

      expect(mockClearToken).toHaveBeenCalledTimes(1);
    });
  });
});
