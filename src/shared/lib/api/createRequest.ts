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
  method?: string;
  body?: any;
  onError?: ((error: any) => void) | null;  // Allow onError to be null
}): Promise<ResponseDefault<T>> {
  try {
    const response = await fetch(endpoint, {
      method,
      headers: {
        "Content-Type": "application/json",
      },
      body: body ? JSON.stringify(body) : null,
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "API request failed");
    }

    return { error: false, payload: data };
  } catch (error: any) {
    // Log the error to Vercel
    console.error(`Error in createRequest: ${error.message || "Unknown error"}`);

    if (onError) {
      onError(error.message || "An unknown error occurred during the API request");
    }

    return { error: true, payload: null };
  }
}