import "./BookList.css"
import api from "../../api";
import { useNavigate } from "react-router-dom";

const BookDetail = ({ book }) => {
    const navigate = useNavigate();
    const handleClick = () => {
        navigate(`/books/${book.book_name}/annotations/`,  { state: { bookId: book.id }});
    }
    const deleteBook = async () => {
        const confirmRemove = confirm("Are you sure you want to delete this book? All your annotations in this book will be deleted as well")
        if (confirmRemove) {
            try {
                await api.delete(`books/${book.id}/`);
                window.location.reload();
            } catch (error) {
                console.log("error deleting", error)
            }
        }
    }
    return(
        <div className="card" onClick={handleClick}>
            <h3>{book.book_name}</h3>
            <p>By {book.author_name} </p>
            <p>You have {book.number_of_annotations} annotation{book.number_of_annotations !== 1 ? "s" : ""} for this book.</p>
            <button type="button" onClick={(e) => {
                e.stopPropagation(); 
                deleteBook();
                }}>
                    Delete Book
            </button>
        </div>
    )
}

export default BookDetail