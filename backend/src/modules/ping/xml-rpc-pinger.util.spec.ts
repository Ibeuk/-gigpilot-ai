import { dispatchPing } from './xml-rpc-pinger.util';

describe('xml-rpc-pinger.util', () => {
  const originalFetch = global.fetch;

  afterEach(() => {
    global.fetch = originalFetch;
  });

  describe('dispatchPing', () => {
    it('should send HTTP GET request for standard search engine indexers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

      const result = await dispatchPing(
        'http://www.google.com/webmasters/tools/ping?sitemap={url}',
        'Search Engine',
        'https://www.fiverr.com/s/YR3VYqp',
        'Fiverr Gig',
        5000,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://www.google.com/webmasters/tools/ping?sitemap=https%3A%2F%2Fwww.fiverr.com%2Fs%2FYR3VYqp',
        expect.objectContaining({
          method: 'GET',
        }),
      );
      expect(result.success).toBe(true);
      expect(result.statusCode).toBe(200);
    });

    it('should send HTTP POST XML-RPC request for RPC pingers', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
      };
      global.fetch = jest.fn().mockResolvedValue(mockResponse as any);

      const result = await dispatchPing(
        'http://rpc.pingomatic.com/',
        'RPC Pinger',
        'https://www.fiverr.com/s/YR3VYqp',
        'Fiverr Gig Test & Special',
        5000,
      );

      expect(global.fetch).toHaveBeenCalledWith(
        'http://rpc.pingomatic.com/',
        expect.objectContaining({
          method: 'POST',
          headers: expect.objectContaining({
            'Content-Type': 'text/xml',
          }),
          body: expect.stringContaining('<methodName>weblogUpdates.ping</methodName>'),
        }),
      );
      expect(result.success).toBe(true);
    });

    it('should handle fetch timeout error (AbortError)', async () => {
      const abortError = new Error('The operation was aborted');
      abortError.name = 'AbortError';
      global.fetch = jest.fn().mockRejectedValue(abortError);

      const result = await dispatchPing(
        'http://rpc.pingomatic.com/',
        'RPC Pinger',
        'https://www.fiverr.com/s/YR3VYqp',
        'Fiverr Gig',
        100,
      );

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(408);
      expect(result.message).toContain('timed out');
    });

    it('should handle general connection errors', async () => {
      global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

      const result = await dispatchPing(
        'http://rpc.pingomatic.com/',
        'RPC Pinger',
        'https://www.fiverr.com/s/YR3VYqp',
        'Fiverr Gig',
        5000,
      );

      expect(result.success).toBe(false);
      expect(result.statusCode).toBe(502);
      expect(result.message).toBe('Network error');
    });
  });
});
