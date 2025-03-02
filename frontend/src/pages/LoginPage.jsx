import AuthForm from "../components/auth/AuthForm";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";

function LoginPage() {
    const location = useLocation();
    const [message, setMessage] = useState("");

    useEffect(() => {
        if (location.state?.message) {
            setMessage(location.state.message);
        }
    }, [location]);

    return (
        <div className="page-container">
            {message && <div className="success-message">{message}</div>}
            <AuthForm formType="login" />
        </div>
    );
}

export default LoginPage;