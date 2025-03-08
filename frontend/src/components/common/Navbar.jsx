import { useNavigate, Link } from "react-router-dom";
import { logout } from "../../api";

function Navbar() {
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        //navigate("/login");
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/books">Book Highlighter</Link>
            </div>

            <div className="navbar-menu">
                <Link to="/books" className="navbar-item">Books</Link>
                <Link to="/annotations" className="navbar-item">Annotations</Link>
            </div>

            <div className="navbar-end">
                <button onClick={handleLogout} className="logout-button">
                    Logout
                </button>
            </div>
        </nav>
    );
}

export default Navbar;