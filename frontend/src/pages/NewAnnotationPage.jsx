import AnnotationForm from "../components/annotations/AnnotationForm";
import { useLocation } from "react-router-dom";

function NewAnnotationPage() {
    const location = useLocation();
    const bookId = location.state?.bookId;
    const formType = location.state?.type;

    return(
        <div className="page">
            <AnnotationForm formType={ formType } bookId={ bookId }/>
        </div>
    );
}

export default NewAnnotationPage

