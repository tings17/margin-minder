import { useNavigate } from "react-router-dom";
import BookList from "../components/books/BookList";

function BookPage() {
    const navigate = useNavigate();
    const handleAddNewBook = () => {
        navigate("/books/new");
    };

    return (
        <>
            <button type="button" onClick={handleAddNewBook}>Add New Book</button>
            <BookList/>
        </>
    )
}

export default BookPage;