import { useNavigate } from "react-router-dom";
import BookList from "../components/books/BookList";

function BookPage() {
    const navigate = useNavigate();
    const handleAddNewBook = () => {
        navigate("/books/new/");
    };

    return (
        <>
        <h1>Click on a book to see your annotations for that book.</h1>
        <div className="button-container">
            <button className="new-book-btn" type="button" onClick={handleAddNewBook}>Add New Book</button>
        </div>
            <BookList/>
        </>
    )
}

export default BookPage;