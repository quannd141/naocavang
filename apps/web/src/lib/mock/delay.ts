/**
 * Simulate network latency for realistic mock UX.
 * Default 200-500ms random.
 */
export function simulateNetwork(min = 200, max = 500): Promise<void> {
  const ms = Math.floor(Math.random() * (max - min + 1)) + min;
  return new Promise((resolve) => setTimeout(resolve, ms));
}
