import { Link } from "react-router-dom";
import { logout } from "../../api";

function Navbar() {

    const handleLogout = () => {
        logout();
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">
                <Link to="/books">Book Highlighter</Link>
            </div>

            <div className="navbar-menu">
                <Link to="/books" className="navbar-item">My Library</Link>
                <Link to="/annotations/all" className="navbar-item">All Annotations</Link>
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