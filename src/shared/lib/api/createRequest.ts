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
  method?: 'POST' | 'GET' | 'PUT' | 'DELETE';
  body?: Record<string, unknown> | null;
  onError?: ((error: any) => void) | null;
}): Promise<ResponseDefault<T>> {
  try {
    const token = await localStorage.getItem('jwt-token');

    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: body ? JSON.stringify(body) : null,
    });

    // Handle non-JSON responses and errors
    if (!response.ok) {
      const errorText = await response.text();
      if (onError) {
        onError(errorText || "API request failed");
      }
      return { error: true, payload: null };
    }

    // Parse JSON response
    let data: T | null = null;
    try {
      data = await response.json();
    } catch (parseError) {
      console.error(`Error parsing JSON response: ${parseError instanceof Error ? parseError.message : "Unknown error"}`);
      if (onError) {
        onError("Failed to parse JSON response");
      }
      return { error: true, payload: null };
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