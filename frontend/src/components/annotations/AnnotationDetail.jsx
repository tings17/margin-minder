import api from "../../api";

const AnnotationDetail = ({annotation}) => {
    const deleteAnnotation = async () => {
        const confirmRemove = confirm("Are you sure you want to delete this annotation?");
        if (confirmRemove) {
            try {
                await api.delete(`annotations/${annotation.id}/`);
                window.location.reload();
            } catch (error) {
                console.log("error deleteing", error);
            }
        }
    }
    return (
        <div className="annotation">
            <h3>"{annotation.image_text}"</h3>
            <p>on page {annotation.page_number}</p>
            <button className="delete-btn" type="button" onClick={(e) => {
                e.stopPropagation();
                deleteAnnotation();
            }}>Delete Annotation</button>
        </div>
    )
}

export default AnnotationDetail;