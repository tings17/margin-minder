import axios from "axios";

const apiUrl = "http://localhost:8000/api/";

const api = axios.create({
    baseURL: apiUrl,
    headers: {
        "Content-Type": "application/json"
    }
})

api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem("access_token");
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        return config
    },
    (error) => Promise.reject(error)
);

api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config;

        const authEndpoint = originalRequest.url === 'token/' || 
        originalRequest.url === 'users/';

        if (error.response?.status === 401 && !originalRequest._retry && !authEndpoint) {
            originalRequest._retry = true; 

            try {
                const refreshToken = localStorage.getItem("refresh_token"); 

                if (!refreshToken) {
                    logout();
                    window.location.href = "/login";
                    return Promise.reject(error)
                }

                const response = await api.post('token/refresh/', {
                    refresh: refreshToken 
                });

                localStorage.setItem("access_token", response.data.access); 
                originalRequest.headers["Authorization"] = `Bearer ${response.data.access}`; 
                return api(originalRequest);
            } catch (refreshError) { 
                logout();
                window.location.href = "/login";
                return Promise.reject(refreshError);
            }
        }

        return Promise.reject(error);
    }
);

export const getBooks = async () => {
    try {
        const response = await api.get(`books/`);
        return response.data
    } catch (error) {
        console.log("error fetching books", error)
        return [];
    }
}

export const getBookTitle = (bookId) => {
    return api.get(`books${bookId ? `?id=${bookId}` : ""}`)
}
export const getAnnotations = (bookId) => {
    return api.get(`annotations${bookId ? `?book=${bookId}` : ""}`);
}

export const notifyAuthChange = () => {
    window.dispatchEvent(new CustomEvent("auth-change"));
};

export const isAuthenticated = () => {
    return localStorage.getItem("access_token") !== null;
};

export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    window.dispatchEvent(new CustomEvent("auth-change"));
};

export default api;
