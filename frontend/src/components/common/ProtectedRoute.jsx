import { Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { isAuthenticated } from "../../api";

function ProtectedRoute({ children, isAuthenticated: isAuthProp }) {
    const [isAuth, setIsAuth] = useState(false);

    useEffect(() => {
        if (isAuthProp !== undefined) {
            setIsAuth(isAuthProp);
            setAuthChecked(true);
            return;
        }

        const checkAuth = async () => {
            try {
                const authStatus = await isAuthenticated();
                setIsAuth(authStatus);
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuth(false);
            }
        };

        checkAuth();
    }, [isAuthProp]);

    if (!isAuth) {
        return <Navigate to="/login" replace />;
    }
    
    return children;
}

export default ProtectedRoute;