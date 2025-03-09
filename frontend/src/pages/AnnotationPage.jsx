import { useLocation, useNavigate } from "react-router-dom";
import AnnotationList from "../components/annotations/AnnotationList";
import { useEffect, useState } from "react";

function AnnotationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const bookId = location.state?.bookId;
    const [bookSpecific, setBookSpecific] = useState(false);

    useEffect(() => {
        setBookSpecific(Boolean(bookId));
    }, [bookId]);

    const handleAddNewAnnotation = () => {
        navigate(`/books/${bookId}/new/`, { state: { bookId: bookId , type: "manual"} });
    };

    const handleAddScanAnnotation = () => {
        navigate(`/books/${bookId}/new/`, { state: { bookId: bookId , type: "scan"} });
    };

    return (
        <>
        {bookSpecific &&  
        <div className="button-container">
            <div className="new-btn">
                <button className="manual" type="button" onClick={handleAddNewAnnotation}>Add Manual Annotation</button>
                <button className="scan" type="button" onClick={handleAddScanAnnotation}>Add Annotation with Image</button>
            </div>
        </div>
        }
            <AnnotationList bookSpecific={bookId}/>
        </>
    )
}

export default AnnotationPage;