import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import api, { notifyAuthChange } from "../../api";

function AuthForm({ formType }) {
    const isLogin = formType === "login";
    const title = isLogin ? "Login" : "Register";
    const route = isLogin ? "token/" : "users/";

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

        // registering but password don't match
        if (!isLogin && password !== confirmPassword) {
            setError("Passwords do not match");
            setIsLoading(false);
            return;
        }

        try {
            const data = { username, password };
            const response = await api.post(route, data);

            if (isLogin) {
                localStorage.setItem("access_token", response.data.access);
                localStorage.setItem("refresh_token", response.data.refresh);
                notifyAuthChange(); 
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
                        errorMessages.push(`${field}: ${errorData[field]}`);
                    }
                    setError(errorMessages.join(". "));
                } else {
                    setError(String(errorData));
                }
            } else {
                setError(isLogin ? "Login failed. Please check your username and password." : "Registration failed. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="auth-form">
            <h1>{title}</h1>
            {error && <div className="error-message">{error}</div>}

            <form onSubmit={handleSubmit}>
                <div className="input-box">
                    <input
                    id="username"
                    type="text"
                    value={username}
                    placeholder="Username"
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    />
                </div>

                <div className="input-box">
                    <input
                    id="password"
                    type="password"
                    value={password}
                    placeholder="Password"
                    onChange={(e) => setPassword(e.target.value)} 
                    required
                    />
                </div>

                {!isLogin && (
                    <div className="input-box">
                        <input
                        id="confirmPassword"
                        type="password"
                        value={confirmPassword}
                        placeholder="Confirm Password"
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        required
                        />
                    </div>
                )}

                <button type="submit" className="auth-button" disabled={isLoading }>
                    {isLoading ? `${title}ing...` : title}
                </button>
            </form>

            <p>
                {isLogin ? "Don't have an account? " : "Already have an account? "}
            <Link to={isLogin ? "/register" : "/login"}>
                {isLogin ? "Register" : "Login"}
            </Link>
            </p>
        </div>
    );
}

export default AuthForm