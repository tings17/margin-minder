import { useState, useEffect } from "react";
import BookDetail from "./BookDetail";
import { getBooks } from "../../api";

function BookList() {
    const [books, setBook] = useState([]);
    const [error, setError] = useState();

    useEffect(() => {
        const fetchBooks = async() => {
            try {
                const response = await getBooks();
                setBook(response.data);
            } catch (error) {
                setError("Error fetching books:", error);
            }
        };
        
        fetchBooks();
    }, []);

    return (
        <>
        {error && <div className="error-message">{error}</div>}
        <div className="books-container">
                {
                    books && books.map(book => {
                        return <BookDetail key={book.id} book={book}/>
                    })
                }
        </div>
        </>
    )
}
export default BookList;