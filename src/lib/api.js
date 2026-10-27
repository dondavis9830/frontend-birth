const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

export async function readApiResponse(response) {
  const body = await response.text();
  let data;

  try {
    data = body ? JSON.parse(body) : null;
  } catch {
    data = null;
  }

  if (!response.ok) {
    if (data && typeof data === 'object' && typeof data.error === 'string') {
      throw new Error(data.error);
    }
    if (response.status === 404) {
      throw new Error(
        'The API route was not found (HTTP 404). Restart the backend from the server folder with npm run dev so it loads the latest admin routes.'
      );
    }
    throw new Error(`The API request failed (HTTP ${response.status}) with an empty or invalid response.`);
  }

  if (!data || typeof data !== 'object') {
    throw new Error(
      `The API returned an empty or invalid response (HTTP ${response.status}). ` +
        'Start the backend and configure server/.env.'
    );
  }

  return data;
}
