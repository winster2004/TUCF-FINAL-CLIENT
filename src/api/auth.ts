import axios from "axios";

const authApi = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

export interface RegisterUserPayload {
  name: string;
  email: string;
  password: string;
}

export interface RegisterUserResponse {
  message?: string;
  token?: string;
  user?: {
    id?: string;
    name?: string;
    email?: string;
  };
  [key: string]: unknown;
}

const getErrorMessage = (error: unknown): string => {
  if (axios.isAxiosError(error)) {
    const responseData = error.response?.data as
      | { message?: string; error?: string }
      | undefined;
    return (
      responseData?.message ||
      responseData?.error ||
      error.message ||
      "Registration failed."
    );
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Registration failed.";
};

export const registerUser = async (
  payload: RegisterUserPayload,
): Promise<RegisterUserResponse> => {
  try {
    const { data } = await authApi.post<RegisterUserResponse>(
      "/auth/register",
      payload,
    );
    return data;
  } catch (error) {
    throw new Error(getErrorMessage(error));
  }
};
