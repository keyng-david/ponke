export type SuccessResponse<T> = {
  error: false;
  payload: T;
};

export type FailureResponse = {
  error: true;
  payload: null;
};

export type ResponseDefault<T> = SuccessResponse<T> | FailureResponse;

export async function createRequest<T>({
  endpoint,
  method = "GET",
  body = null,
  onError = null,
}: {
  endpoint: string;
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE'; // Restrict method to valid HTTP methods
  body?: Record<string, unknown> | null; // Restrict body to object or null for consistency
  onError?: ((error: any) => void) | null;
}): Promise<ResponseDefault<T>> {
  try {
    const token = await localStorage.getItem('jwt-token'); // Include token retrieval

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`, // Add the Authorization header back
      },
      body: body ? JSON.stringify(body) : null,
    });

    // Check if response has a body and parse as JSON accordingly
    let data: T | null = null;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error(`Error parsing JSON response: ${parseError.message}`);
    }

    if (!response.ok) {
      if (onError) {
        onError(data ? (data as any).message || "API request failed" : "API request failed");
      }
      return { error: true, payload: null }; // Return failure response
    }

    return { error: false, payload: data as T };
  } catch (error: any) {
    console.error(`Error in createRequest: ${error.message || "Unknown error"}`);

    if (onError) {
      onError(error.message || "An unknown error occurred during the API request");
    }

    return { error: true, payload: null };
  }
}