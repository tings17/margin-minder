import { useState } from "react"
import api from "../../api";
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
            await api.post('books/', formData, {
                headers: {
                    'Content-Type': 'application/json'
                }
            });
            navigate("/books");
        } catch (error) {
            setError("This book already exists!");
        }
    }

    return (
        <div className="form-container">
            <h3>Add New Book</h3>
            <form onSubmit={handleSubmit} className="book-form">
                {error && <div className="error-message">{error}</div>}
                <label htmlFor="book_name">Title: </label>
                <input
                    id="book_name"
                    type="text"
                    value={formData.book_name}
                    onChange={handleChange}
                />
                <label htmlFor="author_name">Author: </label>
                <input
                    id="author_name"
                    type="text"
                    value={formData.author_name}
                    onChange={handleChange}
                />

                <button type="submit" className="submit-button">
                    Add New Book
                </button>
            </form>
        </div>
    )
}

export default BookForm;