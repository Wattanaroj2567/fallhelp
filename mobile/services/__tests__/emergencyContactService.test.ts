import { listContacts, reorderContacts } from '../emergencyContactService';
import { apiClient } from '../api';

// Mock apiClient but keep toApiError implementation
jest.mock('../api', () => {
  const actual = jest.requireActual('../api');
  return {
    ...actual,
    apiClient: {
      get: jest.fn(),
      post: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    },
  };
});

const mockedApiClient = apiClient as jest.Mocked<typeof apiClient>;

describe('Emergency Contact Service', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('listContacts', () => {
    it('should fetch contacts for given elder ID', async () => {
      const mockContacts = [
        { id: '1', name: 'John Doe', phone: '0812345678', priority: 1, elderId: 'elder-123' },
        { id: '2', name: 'Jane Smith', phone: '0898765432', priority: 2, elderId: 'elder-123' },
      ];

      // Fix: Mock nested data structure { data: { data: ... } }
      mockedApiClient.get.mockResolvedValue({ data: { data: mockContacts } });

      const result = await listContacts('elder-123');

      expect(result).toEqual(mockContacts);
      // Fix: Correct URL endpoint
      expect(mockedApiClient.get).toHaveBeenCalledWith('/api/elders/elder-123/emergency-contacts');
    });

    it('should handle empty contact list', async () => {
      mockedApiClient.get.mockResolvedValue({ data: { data: [] } });

      const result = await listContacts('elder-456');

      expect(result).toEqual([]);
      expect(Array.isArray(result)).toBe(true);
    });

    it('should throw error on API failure', async () => {
      mockedApiClient.get.mockRejectedValue(new Error('Network error'));

      await expect(listContacts('elder-789')).rejects.toEqual(
        expect.objectContaining({
          message: 'Network error',
        })
      );
    });
  });

  describe('reorderContacts', () => {
    it('should update contact order', async () => {
      const contactIds = ['c1', 'c2', 'c3'];
      mockedApiClient.put.mockResolvedValue({ data: { success: true } });

      await reorderContacts('elder-123', contactIds);

      // Fix: Correct URL endpoint
      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/elders/elder-123/emergency-contacts/reorder',
        { contactIds }
      );
    });

    it('should handle reorder with empty array', async () => {
      mockedApiClient.put.mockResolvedValue({ data: { success: true } });

      await reorderContacts('elder-456', []);

      expect(mockedApiClient.put).toHaveBeenCalledWith(
        '/api/elders/elder-456/emergency-contacts/reorder',
        { contactIds: [] }
      );
    });
  });
});
