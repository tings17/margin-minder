import api from "../../api";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import BookDetail from "./BookDetail";
import { getBooks } from "../../api";

function BookList() {
    const [books, setBook] = useState([]);

    useEffect(() => {
        const fetchBooks = async() => {
            try {
                const response = await getBooks();
                setBook(response.data);
                console.log("Book:", books)
            } catch (error) {
                console.error("Error fetching books:", error);
            }
        };
        
        fetchBooks();
    }, []);

    return (
        <div className="books-container">
                {
                    books && books.map(book => {
                        console.log(book)
                        return <BookDetail key={book.id} book={book}/>
                    })
                }
        </div>
    )
}
export default BookList;