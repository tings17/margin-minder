import { useEffect, useState } from "react";
import api, { deleteAnnotation, getBookTitle } from "../../api";
import { useNavigate } from "react-router";

const AnnotationDetail = ({annotation}) => {
    const [error, setError] = useState(null);
    const navigate = useNavigate();
    const bookId = annotation.book
    const [bookTitle, setBookTitle] = useState("");

    useEffect(() => {
        const fetchBookTitle = async () => {
            try {
                const response = await getBookTitle(bookId);
                setBookTitle(response[0].book_name);
            } catch (error) {
                setError("Error fetching book title.");
            }
        }
        fetchBookTitle();
    }, []);
    
    const goToBook = () => [
        navigate(`/books/${bookId}/annotations/`, {state: { bookId: annotation.book }})
    ]
    const handleDeleteAnnotation = async () => {
        const confirmRemove = confirm("Are you sure you want to delete this annotation?");
        if (confirmRemove) {
            try {
                await deleteAnnotation(annotation.id);
                window.location.reload();
            } catch (error) {
                setError(error.message);
            }
        }
    }
    return (
        <>
            {error && <div className="error-message">{error}</div>}
            <div className="annotation">
            <h3>"{annotation.image_text}"</h3>
            <div className="annotation-detail">
                <p>on page {annotation.page_number} of {bookTitle}</p>
                <button className="delete-btn" type="button" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAnnotation();
                }}>Delete Annotation</button>
            </div>
        </div>
        </>
    )
}

export default AnnotationDetail;