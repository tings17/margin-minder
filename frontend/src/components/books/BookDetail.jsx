import { useState } from "react";
import { deleteBook } from "../../api";
import { useNavigate } from "react-router-dom";

const BookDetail = ({ book }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/books/${book.id}/annotations/`,  { state: { bookId: book.id }});
    }
    const [error, setError] = useState("");

    const handleDeleteBook = async () => {
        const confirmRemove = confirm("Are you sure you want to delete this book? All your annotations in this book will be deleted as well.");
        if (confirmRemove) {
            try {
                await deleteBook(book.id);
                window.location.reload();
            } catch (error) {
                setError(error.message);
            }
        }
    }
    return(
        <>
        {error && <div className="error-message">{error}</div>}
        <div className="card" onClick={handleClick}>
            <div className="card-title-container">
                <h3>{book.book_name}</h3>
            </div>
            <p>By {book.author_name} </p>
            <p>You have {book.number_of_annotations} annotation{book.number_of_annotations !== 1 ? "s" : ""} for this book.</p>
            <div className="button-container">
                <button className="delete-btn" type="button" onClick={(e) => {
                    e.stopPropagation(); 
                    handleDeleteBook();
                    }}>Delete Book</button>
            </div>
        </div>
        </>
    )
}

export default BookDetail