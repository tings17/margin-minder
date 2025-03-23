import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import { deleteAnnotation, getAnnotationDetail } from "../api";

function AnnotationDetailPage() {
    const location = useLocation();
    const annotationId = location.state.annotationId;
    const [annotation, setAnnotation] = useState();
    const [error, setError] = useState("");
    const bookTitle = location.state.bookTitle;

    useEffect(() => {
        const fetchAnnotation = async () => {
            try {
                const response = await getAnnotationDetail(annotationId);
                setAnnotation(response);
            } catch (error) {
                setError("Error loading annotation detail.");
            }
        };
        
        fetchAnnotation();

    }, [annotationId]);

    const handleDeleteAnnotation = async () => {
        const confirmRemove = confirm("Are you sure you want to delete this annotation?");
        if (confirmRemove) {
            try {
                await deleteAnnotation(annotationId);
                window.location.reload();
            } catch (error) {
                setError(error.message);
            }
        }
    }

    return (
        <>
            {error && <div className="error-message">{error}</div>}
            {annotation ? (
                <>
            <div className="form-base">
                <h2>{annotation.image_text}</h2>
                <h3>{annotation.annotation_text}</h3>
                <p>Page {annotation.page_number} of {bookTitle}</p>
                <button className="delete-btn" type="button" onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteAnnotation();
                }}>Delete Annotation</button>
            </div>
    
            </>
            ) : <div>No Annotation Data Available</div>}
        </>
    );
}

export default AnnotationDetailPage;