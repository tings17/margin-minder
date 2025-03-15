import { useState, useEffect } from "react";
import BookDetail from "./BookDetail";
import { getBooks } from "../../api";

function BookList() {
    const [books, setBook] = useState([]);
    const [error, setError] = useState("");
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredBooks, setFilteredBooks] = useState([]);

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setFilteredBooks(books.filter((book) => book.book_name.toLowerCase().includes(searchTerm.toLowerCase())));
    }

    useEffect(() => {
        const fetchBooks = async() => {
            try {
                const response = await getBooks();
                setBook(response);
            } catch (error) {
                setError("Error fetching books:", error);
            }
        };
        
        fetchBooks();
    }, []);

    return (
        <>
        {error && <div className="error-message">{error}</div>}
        <div className="search-bar">
            <input type="text" value={searchTerm} onChange={handleInputChange} placeholder="Search by Title" />
        </div>
        <div className="books-container">
            {searchTerm ? (
                filteredBooks && filteredBooks.map(book => {return <BookDetail key={book.id} book={book}/>})
            ) : (
                    books && books.map(book => {
                        return <BookDetail key={book.id} book={book}/>
                    })
            )}
        </div>
        </>
    )
}
export default BookList;