export type SuccessResponse<T> = {
  error: false;
  payload: T;
};

export type FailureResponse = {
  error: true;
  payload: null;
};

export type ResponseDefault<T> = SuccessResponse<T> | FailureResponse

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

    let data: T | null = null;
    try {
      data = await response.json();
    } catch (parseError) {
      if (parseError instanceof Error) {
        console.error(`Error parsing JSON response: ${parseError.message}`);
      } else {
        console.error("Error parsing JSON response: Unknown error");
      }
    }

    if (!response.ok) {
      if (onError) {
        onError(data ? (data as any).message || "API request failed" : "API request failed");
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