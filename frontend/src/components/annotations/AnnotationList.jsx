import { useEffect, useState } from "react";
import { getAnnotations } from "../../api";
import AnnotationDetail from "./AnnotationDetail";
import { useLocation } from "react-router-dom";

function AnnotationList({ bookSpecific }) {
    const [annotations, setAnnotation] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState("");
    const [filteredAnnotations, setFilteredAnnotations] = useState([]);
    const location = useLocation();
    const bookId = bookSpecific !== undefined ? bookSpecific : location.state?.bookId;

    const handleInputChange = (e) => {
        setSearchTerm(e.target.value);
        setFilteredAnnotations(annotations.filter(
            (annotation) => annotation.image_text.toLowerCase().includes(searchTerm.toLowerCase())));
    }
    useEffect(() => {
        const fetchAnnotations = async() => {
            try {
                const response = await getAnnotations(bookId);
                setAnnotation(response);
            } catch (error) {
                setError("Error fetching annotations.", error)
            }
        }
        fetchAnnotations();
    }, [bookId]);

    return (
        <>
        {error && <div className="error-message">{error}</div>}
        <div className="search-bar">
            <input type="text" value={searchTerm} onChange={handleInputChange} placeholder="Search by Keyword" />
        </div>
        <div className="list">
            {searchTerm ? (
                filteredAnnotations && filteredAnnotations.map(annotation => {return <AnnotationDetail key={annotation.id} annotation={annotation}/>}
                )
            ) :
                annotations && annotations.map(annotation => {
                    return <AnnotationDetail key={annotation.id} annotation={annotation}/>
                })
            }
        </div>
        </>
    )
}

export default AnnotationList;