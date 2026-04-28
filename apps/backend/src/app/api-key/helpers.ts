export function maskApiKeyKey(key: string): string {
  return `${key.slice(0, 12)}****`;
}
