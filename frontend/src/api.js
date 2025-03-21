import axios from "axios";

const apiUrl = import.meta.env.VITE_API_URL;

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    },
    withCredentials: true
})

api.interceptors.response.use(
    response => response,
    async error => {
        const originalRequest = error.config;
        
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true;
            
            try {
                await refreshToken();
                return api(originalRequest);
            } catch (refreshError) {
                console.error("Token refresh failed, logging out:", refreshError);
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
        const response = await axios.post(`${apiUrl}login/`, { username, password}, {withCredentials: true})
        return response.data;
    } catch (e) {
        throw new Error("Login Failed");
    }
}

export const logout = async () => {
    try {
        const response = await api.post(`${apiUrl}logout/`, null, {withCredentials: true});
        await notifyAuthChange();
        window.location.href = '/login';
        console.log("successful logout");
        return response.data;
    } catch (e) {
        console.error("Logout process failed:", e);
        window.location.href = '/login';
        throw new Error("Logout Failed");
    }
}
// export const logout = async () => {
//     try {
//         const response = await axios.post(`${apiUrl}logout/`, null, {withCredentials: true})

//         document.cookie = 'access_token=; Max-Age=0; path=/; domain=margin-minder.onrender.com; secure; samesite=none';
//         document.cookie = 'refresh_token=; Max-Age=0; path=/; domain=margin-minder.onrender.com; secure; samesite=none';
//         document.cookie = 'access_token=; Max-Age=0; path=/; domain=margin-minder-vlue.onrender.com; secure; samesite=none';
//         document.cookie = 'refresh_token=; Max-Age=0; path=/; domain=margin-minder-vlue.onrender.com; secure; samesite=none';
        
//         console.log("document.cookie")
//         // document.cookie = 'access_token=; Max-Age=0; path=/; secure; samesite=none';
//         // document.cookie = 'refresh_token=; Max-Age=0; path=/; secure; samesite=none';
        
//         notifyAuthChange();
//         return response.data;
//     } catch (e) {
//         throw new Error("Logout Failed");
//     }
// }

export const refreshToken = async () => {
    try {
        const response = await axios.post(`${apiUrl}refresh/`, null, {withCredentials: true});
        return response.data;
    } catch (e) {
        throw new Error("refreshing token failed");
    }
}

export const getBooks = async () => {
    try {
        const response = await api.get(`books/`, {withCredentials: true});
        return response.data
    } catch (error) {
        return [];
    }
}

export const getBookTitle = async (bookId) => {
    try {
        const response = await api.get(`books/${bookId ? `?id=${bookId}` : ""}`, {withCredentials: true})
        return response.data
    } catch (error) {
        return "";
    }
}
export const getAnnotations = async (bookId) => {
    try {
        const response = await api.get(`annotations/${bookId ? `?book=${bookId}` : ""}`, {withCredentials: true});
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
        await api.delete(`books/${bookId}/`, {withCredentials: true});
    } catch (error) {
        throw new Error("Error deleting book");
    }
}

export const deleteAnnotation = async (annotationId) => {
    try {
        await api.delete(`annotations/${annotationId}/`, {withCredentials: true});
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
        const response = await axios.get(`${apiUrl}authcheck/`, {withCredentials: true})
        return response.status === 200;
    } catch (error) {
        return false;
    }
}

export default api;
