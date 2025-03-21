import axios from "axios";
import { jwtDecode } from "jwt-decode";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    },
})

api.interceptors.request.use(
    (config) => {
        const authTokens = localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null;
            
        if (authTokens?.access) {
            config.headers.Authorization = `Bearer ${authTokens.access}`;
        }
        return config;
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;
        
        const isAuthEndpoint = originalRequest.url?.includes('token/') ||
                               originalRequest.url?.includes('users/');
        
        if (error.response?.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
            originalRequest._retry = true;
            
            try {
                const authTokens = localStorage.getItem('authTokens')
                    ? JSON.parse(localStorage.getItem('authTokens'))
                    : null;
                
                if (!authTokens?.refresh) {
                    throw new Error("No refresh token available");
                }
                
                const response = await axios.post(`${apiUrl}token/refresh/`, {
                    refresh: authTokens.refresh
                });
                
                if (response.data.access) {
                    const newTokens = {
                        access: response.data.access,
                        refresh: response.data.refresh || authTokens.refresh
                    };
                    
                    localStorage.setItem('authTokens', JSON.stringify(newTokens));
                    
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                }
            } catch (refreshError) {
                console.error("Token refresh failed:", refreshError);
                await logout();
                window.location.href = '/login';
                return Promise.reject(refreshError);
            }
        }
        
        return Promise.reject(error);
    }
);

export const register = async (username, password) => {
    try {
        const response = await axios.post(`${apiUrl}users/`, { username, password}, { withCredentials: true})
        return response.data;
    } catch (e) {
        throw new Error("Registration failed!");
    }
}

export const login = async (username, password) => {
    try {
        const response = await axios.post(`${apiUrl}token/`, { username, password}, {withCredentials: true})

        if (response.data.access && response.data.refresh) {
            localStorage.setItem('authTokens', JSON.stringify(response.data));
            await notifyAuthChange();
            return response.data;
        } else {
            throw new Error("Invalid response from server");
        }
    } catch (e) {
        throw new Error("Login Failed");
    }
}

export const logout = async () => {
    try {
        localStorage.removeItem('authTokens');
        await notifyAuthChange();
        window.location.href = '/login';
        console.log("successful logout");
        return { success: true };
    } catch (e) {
        console.error("Logout process failed:", e);
        window.location.href = '/login';
        throw new Error("Logout Failed");
    }
}

export const refreshToken = async () => {
    try {
        const authTokens = localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null;
            
        if (!authTokens?.refresh) {
            throw new Error("No refresh token available");
        }
        
        const response = await axios.post(`${apiUrl}token/refresh/`, {
            refresh: authTokens.refresh
        });
        
        const newTokens = {
            access: response.data.access,
            refresh: response.data.refresh || authTokens.refresh
        };
        
        localStorage.setItem('authTokens', JSON.stringify(newTokens));
        return response.data;
    } catch (e) {
        throw new Error("refreshing token failed");
    }
}

export const getBooks = async () => {
    try {
        const response = await api.get(`books/`);
        return response.data
    } catch (error) {
        return [];
    }
}

export const getBookTitle = async (bookId) => {
    try {
        const response = await api.get(`books/${bookId ? `?id=${bookId}` : ""}`)
        return response.data
    } catch (error) {
        return "";
    }
}
export const getAnnotations = async (bookId) => {
    try {
        const response = await api.get(`annotations/${bookId ? `?book=${bookId}` : ""}`);
        return response.data
    } catch (error) {
        return [];
    }
}

export const addBook = async (bookData) => {
    try {
      const response = await api.post('books/', bookData, {
        withCredentials: true
      });
      return response.data;
    } catch (error) {
      console.error("Error adding book:", error);
      throw new Error(error.response?.data?.detail || "This book already exists!");
    }
}

export const deleteBook = async(bookId) => {
    try {
        await api.delete(`books/${bookId}/`);
    } catch (error) {
        throw new Error("Error deleting book");
    }
}

export const deleteAnnotation = async (annotationId) => {
    try {
        await api.delete(`annotations/${annotationId}/`);
    } catch (error) {
        throw new Error("Error deleting annotation");
    }
}

export const notifyAuthChange = async () => {
    const authStatus = await isAuthenticated();
    window.dispatchEvent(new CustomEvent("auth-change", { 
      detail: { isAuthenticated: authStatus } 
    }));
  };


export const isAuthenticated = async () => {
    try {
        const authTokens = localStorage.getItem('authTokens')
            ? JSON.parse(localStorage.getItem('authTokens'))
            : null;
            
        if (!authTokens) {
            return false;
        }
        
        const decodedToken = jwtDecode(authTokens.access);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
            try {
                await refreshToken();
                return true;
            } catch {
                return false;
            }
        }
        
        return true;
    } catch (error) {
        return false;
    }
}

export default api;
