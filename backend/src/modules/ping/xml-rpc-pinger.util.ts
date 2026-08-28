import { Logger } from '@nestjs/common';

export interface DispatchPingResult {
  statusCode: number;
  latencyMs: number;
  success: boolean;
  message: string;
}

const logger = new Logger('PingDispatcherUtil');

/**
 * Dispatch real XML-RPC or HTTP GET/POST ping to external target nodes
 */
export async function dispatchPing(
  targetUrlPattern: string,
  category: string,
  gigUrl: string,
  gigTitle: string = 'Fiverr Gig Promotion',
  timeoutMs: number = 5000,
): Promise<DispatchPingResult> {
  const startTime = Date.now();
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const isRpc = category === 'RPC Pinger' || targetUrlPattern.includes('rpc') || targetUrlPattern.includes('RPC');

  try {
    let response: Response;

    if (isRpc) {
      // Build standard weblogUpdates.ping XML-RPC payload
      const xmlPayload = `<?xml version="1.0"?>
<methodCall>
  <methodName>weblogUpdates.ping</methodName>
  <params>
    <param><value>${escapeXml(gigTitle)}</value></param>
    <param><value>${escapeXml(gigUrl)}</value></param>
  </params>
</methodCall>`;

      const targetEndpoint = targetUrlPattern.includes('{url}')
        ? targetUrlPattern.replace('{url}', encodeURIComponent(gigUrl))
        : targetUrlPattern;

      response = await fetch(targetEndpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'text/xml',
          'User-Agent': 'GigPilot-AI-AutoPinger/1.0 (+https://gigpilot.ai)',
        },
        body: xmlPayload,
        signal: controller.signal,
      });
    } else {
      // Standard HTTP GET / POST indexer target
      const requestUrl = targetUrlPattern.includes('{url}')
        ? targetUrlPattern.replace('{url}', encodeURIComponent(gigUrl))
        : targetUrlPattern;

      response = await fetch(requestUrl, {
        method: 'GET',
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 GigPilot/1.0',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        },
        signal: controller.signal,
      });
    }

    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;
    const success = response.ok || response.status === 200 || response.status === 204 || response.status === 301 || response.status === 302;

    return {
      statusCode: response.status,
      latencyMs,
      success,
      message: success ? `Successfully pinged target (${response.statusText || 'OK'})` : `Target returned status ${response.status}`,
    };
  } catch (error: any) {
    clearTimeout(timeoutId);
    const latencyMs = Date.now() - startTime;

    if (error.name === 'AbortError') {
      return {
        statusCode: 408,
        latencyMs,
        success: false,
        message: `Connection timed out after ${timeoutMs}ms`,
      };
    }

    return {
      statusCode: 502,
      latencyMs,
      success: false,
      message: error.message || 'Failed to connect to ping endpoint',
    };
  }
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
      default: return c;
    }
  });
}
