export async function readApiError(response: Response, fallback: string) {
  try {
    const text = await response.text();
    if (!text.trim()) {
      return fallback;
    }

    const data = JSON.parse(text) as { error?: string };
    return data.error ?? fallback;
  } catch {
    return fallback;
  }
}
