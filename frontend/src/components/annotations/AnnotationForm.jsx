import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import api from "../../api";

function AnnotationForm({ formType, bookId }) {
    const [formData, setFormData] = useState({
      book: bookId,
      page_number: "",
      image: null,
      image_text: "",
      annotation_type: formType,
    });
  
    const [isProcessing, setIsProcessing] = useState(false);
    const [textDetected, setTextDetected] = useState(false);
    const [annotationId, setAnnotationId] = useState(null);
    const [error, setError] = useState(null);

    const navigate = useNavigate();

    // Handle text and number input changes
    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData({
        ...formData,
        [id]: value
      });
    };

    // Handle file input change
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        setFormData({
          ...formData,
        image: e.target.files[0]
        });
      }
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsProcessing(true);
      setError(null);
      
      try {
        if (textDetected && annotationId) {
          await api.patch(`annotations/${annotationId}/`, { image_text: formData.image_text },
          {headers: {
            'Content-Type': 'application/json'
          }});
          navigate(`/books/${bookId}/annotations/`,  { state: { bookId: bookId }});
        } else {
          const response = await api.post('annotations/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          setAnnotationId(response.data.id);

          if (formData.annotation_type === "scan") {
            setFormData({...formData, image_text: response.data.image_text, annotation_type: "manual"});
            setTextDetected(true);
          } else {
            navigate(`/books/${bookId}/annotations/`,  { state: { bookId: bookId }});
          }
        }      
        // Handle successful submission
        setIsProcessing(false);
      } catch (error) {
        setIsProcessing(false);
        setError("Failed to create annotation. Please try again.", error);
      }
    };
  
    return (
      <div className="annotation-form">
        <h3>{formData.annotation_type === "manual" ? (!textDetected ? "Add Manual Annotation" : "Edit Your Annotation") : "Add Annotation from Image"}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              id="page_number"
              type="number"
              value={formData.page_number}
              onChange={handleChange}
              placeholder="Enter page number"
            />
          </div>
  
          {formData.annotation_type === "manual" ? (
            <div className="input-box">
              <textarea
                id="image_text"
                value={formData.image_text}
                onChange={handleChange}
                placeholder="Enter your annotation"
                required
                rows={5}
              />
            </div>
          ) : (
            <div className="input-box">
              <label htmlFor="image">Upload Image with Highlighted Text: </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                required
                disabled={textDetected}
              />
              {textDetected && (
                <textarea
                id='image_text'
                value={formData.image_text}
                onChange={handleChange}/>
              )}
            </div>
          )}
          
          <button
            type="submit" 
            disabled={isProcessing}
            className="submit-button"
          >
            {!textDetected && formType === "scan" ? "Get Text Extraction" : (isProcessing ? "Processing..." : "Save Annotation")}
          </button>
        </form>
      </div>
    );
  }
  
  export default AnnotationForm;