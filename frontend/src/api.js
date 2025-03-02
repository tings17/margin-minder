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
            config.headers.Authorization = "Bearer ${token}";
        }
        return config
    },
    (error) => Promise.reject(error)
);

// token refresh (automatically get a new access token when the old one expires (without requiring the user to log in again))
api.interceptors.request.use(
    (response) => response, // passes successful response through unchanged
    async (error) => { // handle errors (401 unauth)
        const originalRequest = error.config;

        if (error.response?.status === 401 && !originalRequest._retry) { // when 401 occurs, haven't tried refreshing yet
            originalRequest._retry = true; // mark the request as retried to prevent infinite loops

            try {
                const refreshToken = localStorage.getItem("refresh_token"); //get refresh token

                if (!refreshToken) {
                    window.location.href = "/login";
                    return Promise.reject(error)
                }

                const response = await axios.post("${apiUrl}token/refresh/", {
                    refresh: refreshToken // call the token refresh endpoint with the refresh token
                });

                localStorage.setItem("access_token", response.data.access); // store new access token
                originalRequest.headers["Authorization"] = "Bearer ${response.data.access}"; // update the authorization header in the original request
                return api(originalRequest); //retry the original request with the new token
            } catch (refreshError) { // if refresh fails
                localStorage.removeItem("access_token"); // clear both tokens (fully log out)
                localStorage.removeItem("refresh_token");
                window.location.href = "/login"; //redirect to login page
                return Promise.reject(refreshError); // reject the promise with refresh error
            }
        }

        return Promise.reject(error);
    }
);

export const setAuthStatus = (status) => {
    window.dispatchEvent(new CustomEvent("auth-change"));
};

export const isAuthenticated = () => {
    return localStorage.getItem("access_token") !== null;
};

export const logout = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
};

export default api; // exports the configured axios instance so it can be imported and used in other files
