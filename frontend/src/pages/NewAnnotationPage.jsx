import AnnotationForm from "../components/annotations/AnnotationForm";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

// technically not book page; rather new annotation page
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

