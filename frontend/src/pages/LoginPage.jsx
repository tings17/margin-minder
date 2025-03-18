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
        <AuthForm formType="login" successMessage={message} />
    );
}

export default LoginPage;