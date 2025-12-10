import {
  getProfile,
  updateProfile,
  changePassword,
  updatePushToken,
  getUserElders,
  deleteAccount,
} from '../userService';
import { apiClient } from '../api';
import type { UserProfile, Elder } from '../types';

// Mock dependencies
jest.mock('../api', () => ({
  apiClient: {
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
  toApiError: jest.fn((error) => error),
}));

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('userService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  // ==========================================
  // ✅ Test Group 1: Get Profile
  // จากโค้ดจริง: getProfile() function
  // ==========================================

  describe('getProfile', () => {
    it('should fetch user profile successfully', async () => {
      const mockProfile: UserProfile = {
        id: '1',
        email: 'user@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'CAREGIVER',
        phone: '0812345678',
      };

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockProfile,
        },
      });

      const result = await getProfile();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/profile');
      expect(result).toEqual(mockProfile);
    });

    it('should handle errors when fetching profile', async () => {
      mockApiClient.get.mockRejectedValueOnce({
        status: 401,
        message: 'Unauthorized',
      });

      await expect(getProfile()).rejects.toMatchObject({
        status: 401,
        message: 'Unauthorized',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 2: Update Profile
  // จากโค้ดจริง: updateProfile() function
  // ==========================================

  describe('updateProfile', () => {
    it('should update profile successfully', async () => {
      const payload = {
        firstName: 'Jane',
        lastName: 'Smith',
        phone: '0898765432',
      };

      const mockUpdatedProfile: UserProfile = {
        id: '1',
        email: 'user@example.com',
        firstName: 'Jane',
        lastName: 'Smith',
        role: 'CAREGIVER',
        phone: '0898765432',
      };

      mockApiClient.put.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockUpdatedProfile,
        },
      });

      const result = await updateProfile(payload);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/profile', payload);
      expect(result).toEqual(mockUpdatedProfile);
    });

    it('should handle validation errors', async () => {
      const payload = {
        phone: 'invalid',
      };

      mockApiClient.put.mockRejectedValueOnce({
        status: 400,
        message: 'Invalid phone number format',
      });

      await expect(updateProfile(payload)).rejects.toMatchObject({
        status: 400,
        message: 'Invalid phone number format',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 3: Change Password
  // จากโค้ดจริง: changePassword() function
  // ==========================================

  describe('changePassword', () => {
    it('should change password successfully', async () => {
      const payload = {
        currentPassword: 'oldPassword123',
        newPassword: 'newPassword456',
      };

      mockApiClient.put.mockResolvedValueOnce({ data: { success: true } });

      await changePassword(payload);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/password', payload);
    });

    it('should handle incorrect current password', async () => {
      const payload = {
        currentPassword: 'wrongPassword',
        newPassword: 'newPassword456',
      };

      mockApiClient.put.mockRejectedValueOnce({
        status: 401,
        message: 'Current password is incorrect',
      });

      await expect(changePassword(payload)).rejects.toMatchObject({
        status: 401,
        message: 'Current password is incorrect',
      });
    });

    it('should validate new password strength', async () => {
      const payload = {
        currentPassword: 'oldPassword123',
        newPassword: '123',
      };

      mockApiClient.put.mockRejectedValueOnce({
        status: 400,
        message: 'Password must be at least 6 characters',
      });

      await expect(changePassword(payload)).rejects.toMatchObject({
        status: 400,
        message: 'Password must be at least 6 characters',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 4: Push Token
  // จากโค้ดจริง: updatePushToken() function
  // ==========================================

  describe('updatePushToken', () => {
    it('should update push token successfully', async () => {
      const payload = {
        pushToken: 'ExponentPushToken[xxxxxxxxxxxxxxxxxxxxxx]',
      };

      mockApiClient.put.mockResolvedValueOnce({ data: { success: true } });

      await updatePushToken(payload);

      expect(mockApiClient.put).toHaveBeenCalledWith('/api/users/push-token', payload);
    });

    it('should handle invalid push token format', async () => {
      const payload = {
        pushToken: 'invalid-token',
      };

      mockApiClient.put.mockRejectedValueOnce({
        status: 400,
        message: 'Invalid push token format',
      });

      await expect(updatePushToken(payload)).rejects.toMatchObject({
        status: 400,
        message: 'Invalid push token format',
      });
    });
  });

  // ==========================================
  // ✅ Test Group 5: User Elders
  // จากโค้ดจริง: getUserElders() function
  // ==========================================

  describe('getUserElders', () => {
    it('should fetch user elders successfully', async () => {
      const mockElders: Elder[] = [
        {
          id: '1',
          firstName: 'สมชาย',
          lastName: 'ใจดี',
          gender: 'MALE',
          dateOfBirth: '1950-01-01',
          address: '123 หมู่บ้าน',
          profileImage: 'https://example.com/image.jpg',
        },
        {
          id: '2',
          firstName: 'สมหญิง',
          lastName: 'ใจดี',
          gender: 'FEMALE',
          dateOfBirth: '1952-05-15',
          address: '123 หมู่บ้าน',
          profileImage: null,
        },
      ];

      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: mockElders,
        },
      });

      const result = await getUserElders();

      expect(mockApiClient.get).toHaveBeenCalledWith('/api/users/elders');
      expect(result).toEqual(mockElders);
      expect(result).toHaveLength(2);
    });

    it('should return empty array when no elders found', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: [],
        },
      });

      const result = await getUserElders();

      expect(result).toEqual([]);
    });

    it('should handle null data in response', async () => {
      mockApiClient.get.mockResolvedValueOnce({
        data: {
          success: true,
          data: null,
        },
      });

      const result = await getUserElders();

      expect(result).toEqual([]);
    });
  });

  // ==========================================
  // ✅ Test Group 6: Delete Account
  // จากโค้ดจริง: deleteAccount() function
  // ==========================================

  describe('deleteAccount', () => {
    it('should delete account successfully', async () => {
      mockApiClient.delete.mockResolvedValueOnce({ data: { success: true } });

      await deleteAccount();

      expect(mockApiClient.delete).toHaveBeenCalledWith('/api/users/me');
    });

    it('should handle errors when deleting account', async () => {
      mockApiClient.delete.mockRejectedValueOnce({
        status: 403,
        message: 'Cannot delete account with active devices',
      });

      await expect(deleteAccount()).rejects.toMatchObject({
        status: 403,
        message: 'Cannot delete account with active devices',
      });
    });
  });
});
