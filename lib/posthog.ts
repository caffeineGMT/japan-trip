/**
 * PostHog Server-Side Client
 * For backend event tracking
 */

import { PostHog } from 'posthog-node';

let posthogClient: PostHog | null = null;

export function getPostHogClient(): PostHog | null {
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) {
    console.warn('PostHog API key not configured');
    return null;
  }

  if (!posthogClient) {
    posthogClient = new PostHog(
      process.env.NEXT_PUBLIC_POSTHOG_KEY,
      {
        host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://app.posthog.com',
      }
    );
  }

  return posthogClient;
}

export async function trackEvent(
  distinctId: string,
  event: string,
  properties?: Record<string, any>
) {
  const client = getPostHogClient();
  if (!client) return;

  try {
    client.capture({
      distinctId,
      event,
      properties,
    });
    await client.flush();
  } catch (error) {
    console.error('PostHog tracking error:', error);
  }
}

export async function shutdownPostHog() {
  if (posthogClient) {
    await posthogClient.shutdown();
  }
}
