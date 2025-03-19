import { useState } from "react"
import { addBook } from "../../api";
import { useNavigate } from "react-router-dom";

function BookForm() {
    const [formData, setFormData] = useState({
        book_name: "",
        author_name: "",
    }); 

    const [errors, setErrors] = useState({
        general: null,
        book_name: null,
        author_name: null,
    })

    const navigate = useNavigate();
    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({
            ...formData,
            [id]: value
        });

        if (errors[id]) {
            setErrors({
                ...errors,
                [id]: null
            });
        }
    };

    const validateForm = () => {
        const newErrors = {
            general: null,
            book_name: null,
            author_name: null
        };
        
        let isValid = true;
        
        // empty book title
        if (!formData.book_name.trim()) {
            newErrors.book_name = "Please enter the book title.";
            isValid = false;
        }
        
        // empty author name
        if (!formData.author_name.trim()) {
            newErrors.author_name = "Please enter the author name.";
            isValid = false;
        }
        
        setErrors(newErrors);
        return isValid;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            await addBook(formData);
            navigate("/books");
        } catch (error) {
            if (error.response && error.response.data) {
                if (error.response.data.detail && 
                    error.response.data.detail.includes("already exists")) {
                    setErrors({
                        ...errors,
                        general: "This book already exists!"
                    
                    });
                }
            } else {
                setErrors({
                    ...errors,
                    general: error.message || "Failed to add book. Please try again."
                });
            }
        }
    }

    return (
        <div className="form-base">
            <h1>Add New Book</h1>
            <form onSubmit={handleSubmit}>
                {errors.general && <div className="message">{errors.general}</div>}
                <div className="input-box">
                    <input
                        id="book_name"
                        type="text"
                        placeholder="Title"
                        value={formData.book_name}
                        onChange={handleChange}
                    />
                    {errors.book_name && <div className="field-error">{errors.book_name}</div>}
                </div>
                <div className="input-box">
                    <input
                        id="author_name"
                        type="text"
                        placeholder="Author"
                        value={formData.author_name}
                        onChange={handleChange}
                    />
                    {errors.author_name && <div className="field-error">{errors.author_name}</div>}
                </div>

                <button type="submit" className="auth-button">
                    Add New Book
                </button>
            </form>
        </div>
    )
}

export default BookForm;