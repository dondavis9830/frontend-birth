import axios from 'axios';

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL?.replace(/\/$/, '') || '';

export function apiUrl(path) {
  return `${apiBaseUrl}${path}`;
}

export function getApiErrorMessage(error) {
  if (axios.isAxiosError(error)) {
    const serverMessage = error.response?.data?.error ?? error.response?.data?.message;

    if (typeof serverMessage === 'string' && serverMessage.trim()) {
      return serverMessage;
    }

    if (error.response?.status === 404) {
      return 'The API route was not found (HTTP 404). Restart the backend from the server folder with npm run dev so it loads the latest admin routes.';
    }

    return `The API request failed (HTTP ${error.response?.status ?? 'unknown'}). Start the backend and configure server/.env.`;
  }

  if (error instanceof Error && error.message) {
    return error.message;
  }

  return 'The API request failed.';
}

export async function readApiResponse(response) {
  const data = response?.data ?? null;

  if (response?.status >= 400) {
    const errorMessage = getApiErrorMessage({
      response: {
        status: response.status,
        data,
      },
    });
    throw new Error(errorMessage);
  }

  if (!data || typeof data !== 'object') {
    throw new Error('The API returned an empty or invalid response. Start the backend and configure server/.env.');
  }

  return data;
}
