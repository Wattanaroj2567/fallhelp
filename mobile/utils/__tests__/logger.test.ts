import Logger from '../logger';

describe('Logger Utility', () => {
  // Spy on console methods
  let consoleDebugSpy: jest.SpyInstance;
  let consoleInfoSpy: jest.SpyInstance;
  let consoleWarnSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;

  beforeEach(() => {
    consoleDebugSpy = jest.spyOn(console, 'debug').mockImplementation();
    consoleInfoSpy = jest.spyOn(console, 'info').mockImplementation();
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
  });

  afterEach(() => {
    consoleDebugSpy.mockRestore();
    consoleInfoSpy.mockRestore();
    consoleWarnSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  describe('debug', () => {
    it('should log debug messages to console.debug', () => {
      Logger.debug('Test debug message');
      expect(consoleDebugSpy).toHaveBeenCalled();
      // Logger adds timestamp, so just check it was called
    });
  });

  describe('info', () => {
    it('should log info messages to console.info', () => {
      Logger.info('Test info message');
      expect(consoleInfoSpy).toHaveBeenCalled();
    });
  });

  describe('warn', () => {
    it('should log warnings to console.warn', () => {
      Logger.warn('Test warning');
      expect(consoleWarnSpy).toHaveBeenCalled();
    });
  });

  describe('error', () => {
    it('should log errors to console.error', () => {
      const testError = new Error('Test error');
      Logger.error('Failed operation:', testError);
      expect(consoleErrorSpy).toHaveBeenCalled();
    });

    it('should handle string errors', () => {
      Logger.error('Simple error message');
      expect(consoleErrorSpy).toHaveBeenCalled();
    });
  });
});
