import { useNavigate } from "react-router-dom"

const AnnotationDetail = ({annotation}) => {

    return (
        <div className="annotation">
            <h3>"{annotation.image_text}"</h3>
            <p>from page {annotation.page_number}</p>
        </div>
    )
}

export default AnnotationDetail;