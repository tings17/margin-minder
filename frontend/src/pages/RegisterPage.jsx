import AuthForm from "../components/auth/AuthForm";

function RegisterPage() {
    return (
        <div className="page-container">
            <AuthForm formType="register" />
        </div>
    );
}

export default RegisterPage