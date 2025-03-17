import { useState } from "react"
import { addBook } from "../../api";
import { useNavigate } from "react-router-dom";

function BookForm() {
    const [formData, setFormData] = useState({
        book_name: "",
        author_name: "",
    }); 
    const [error, setError] = useState("");
    const navigate = useNavigate();
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
        try {
            await addBook(formData);
            navigate("/books");
        } catch (error) {
            setError(error.message || "This book already exists!");
        }
    }

    return (
        <div className="book-form">
            <h1>Add New Book</h1>
            <form onSubmit={handleSubmit}>
                {error && <div className="error-message">{error}</div>}
                <div className="input-box">
                    <input
                        id="book_name"
                        type="text"
                        placeholder="Title"
                        value={formData.book_name}
                        onChange={handleChange}
                    />
                </div>
                <div className="input-box">
                    <input
                        id="author_name"
                        type="text"
                        placeholder="Author"
                        value={formData.author_name}
                        onChange={handleChange}
                    />
                </div>

                <button type="submit" className="auth-button">
                    Add New Book
                </button>
            </form>
        </div>
    )
}

export default BookForm;