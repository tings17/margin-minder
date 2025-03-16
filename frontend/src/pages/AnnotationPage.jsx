import { useLocation, useNavigate } from "react-router-dom";
import AnnotationList from "../components/annotations/AnnotationList";
import { useEffect, useState } from "react";
import { getBookTitle } from "../api";

function AnnotationPage() {
    const navigate = useNavigate();
    const location = useLocation();
    const bookId = location.state?.bookId;
    const [bookTitle, setBookTitle] = useState("");
    const [bookSpecific, setBookSpecific] = useState(false);

    useEffect(() => {
        setBookSpecific(Boolean(bookId));
    }, [bookId]);

    useEffect(() => {
        const fetchBookTitle = async() => {
            try {
                const response = await getBookTitle(bookId);
                setBookTitle(response[0].book_name);
            } catch (error) {
                console.log("Error fetching book title", error);
            }
        };
        fetchBookTitle();
    }, []);

    const handleAddNewAnnotation = () => {
        navigate(`/books/${bookId}/new/`, { state: { bookId: bookId , type: "manual"} });
    };

    const handleAddScanAnnotation = () => {
        navigate(`/books/${bookId}/new/`, { state: { bookId: bookId , type: "scan"} });
    };

    return (
        <>
          {bookSpecific ? (
            <>
              <h1>Annotations for {bookTitle}</h1>
              <div className="button-container">
                <div className="new-btn">
                  <button className="manual" type="button" onClick={handleAddNewAnnotation}>
                    Add Manual Annotation
                  </button>
                  <button className="scan" type="button" onClick={handleAddScanAnnotation}>
                    Add Annotation with Image
                  </button>
                </div>
              </div>
            </>
          ) : (
            <>
              <h1>All Annotations</h1>
            </>
          )}
          <AnnotationList bookSpecific={bookId} />
        </>
      );
};

export default AnnotationPage;