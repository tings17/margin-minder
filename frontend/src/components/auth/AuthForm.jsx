import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { setAuthStatus } from "../../api";
import "./Auth.css";

function AuthForm({ formType }) {
    const isLogin = formType === "login";
    const title = isLogin ? "Login" : "Register";
    const route = isLogin ? "token/" : "users/"

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [error, setError] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");
        setIsLoading(true);

        if (!isLogin && password != confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const data = isLogin
            ? { username, password }
            : { username, password };

            const response = await api.post(route, data);

            if (isLogin) {
                localStorage.setItem("access_token", response.data.access);
                localStorage.setItem("refresh_token", response.data.refresh);
                setAuthStatus(true);
                navigate("/books");
            } else {
                navigate("/login", { state: { message: "Registration successful! Please log in."}});
            }
        } catch (err) {
            if (err.response && err.response.data) {
                const errorData = err.response.data;
                if (typeof errorData === "object") {
                    const errorMessages = [];
                    for (const field in errorData) {
                        errorMessages.push("$(field): $(errorData[field]}");
                    }
                    setError(errorMessages.join(". "));
                } else {
                    setError(String(errorData));
                }
            } else {
                setError(isLogin ? "Login failed. Please check your username and password." : "Registration failed. Please try again.");
            }
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-container">
            <h2>{title}</h2>

            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label htmlFor="username">Username</label>
                    <input
                    id="username"
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="form-control"
                    />
                </div>

                <div className="form-group">
                    <label htmlFor="password">Password</label>
                    <input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="form-control"
                    />
                </div>

                {!isLogin && (
                    <div className="form-group">
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        className="form-control"
                        />
                    </div>
                )}

                <button
                type="submit"
                className="auth-button"
                disabled={isLoading}
                >
                    {isLoading ? "${title}ing..." : title}
                </button>
            </form>

            <p className="auth-switch">
                {isLogin
                ? "Don't have an account? "
            : "Already have an account? "
            }
            <Link to={isLogin ? "/register" : "/login"}>
                {isLogin ? "Register" : "Login"}
            </Link>
            </p>
        </div>
    );
}

export default AuthForm