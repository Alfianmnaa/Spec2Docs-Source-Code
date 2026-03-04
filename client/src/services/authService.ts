import axiosInstance from "@/lib/axios";

export interface LoginData {
  email: string;
  password: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
    token: string;
  };
}

export interface UpdateProfileData {
  name: string;
}

export interface UpdateProfileResponse {
  success: boolean;
  message: string;
  data: {
    user: {
      id: string;
      name: string;
      email: string;
    };
  };
}

export const authApi = {
  login: async (data: LoginData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/api/auth/login", data);
    return response.data;
  },

  register: async (data: RegisterData): Promise<AuthResponse> => {
    const response = await axiosInstance.post("/api/auth/register", data);
    return response.data;
  },

  updateProfile: async (data: UpdateProfileData): Promise<UpdateProfileResponse> => {
    const response = await axiosInstance.put("/api/auth/profile", data);
    return response.data;
  },

  logout: async (): Promise<void> => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
