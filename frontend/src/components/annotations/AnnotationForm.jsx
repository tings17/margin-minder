import { useState } from "react";
import { useLocation } from "react-router-dom";
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
  
    // Handle text and number input changes
    const handleChange = (e) => {
      const { id, value } = e.target;
      console.log(id)
      setFormData({
        ...formData,
        [id]: value
      });
    };

    // Handle file input change
    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        console.log(e.target.files[0]);
        setFormData({
          ...formData,
        image: e.target.files[0]
        });
        console.log(formData);
      }
    };
  
    // Handle form submission
    const handleSubmit = async (e) => {
      e.preventDefault();
      setIsProcessing(true);
      setError(null);
      
      try {
        if (textDetected && annotationId) {
          console.log(`inside`)
          const updateResponse = await api.patch(`annotations/${annotationId}/`, { image_text: formData.image_text },
          {headers: {
            'Content-Type': 'application/json'
          }});
        } else {
          const response = await api.post('annotations/', formData, {
            headers: {
              'Content-Type': 'multipart/form-data',
            }
          });

          setAnnotationId(response.data.id);
          console.log(`annotation: ${response.data.id}`)

          if (formData.annotation_type === "scan") {
            setFormData({...formData, image_text: response.data.image_text, annotation_type: "manual"});
            setTextDetected(true);
          }
        }      
        // Handle successful submission
        setIsProcessing(false);
        
        
      } catch (error) {
        setIsProcessing(false);
        setError("Failed to create annotation. Please try again.");
      }
    };
  
    return (
      <div className="annotation-form-container">
        <h3>{formData.annotation_type === "manual" ? (!textDetected ? "Add Manual Annotation" : "Edit Your Annotation") : "Add Annotation from Image"}</h3>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit} className="annotation-form">
          <div className="form-group">
            <label htmlFor="page_number">Page Number: </label>
            <input
              id="page_number"
              type="number"
              value={formData.page_number}
              onChange={handleChange}
              placeholder="Enter page number"
            />
          </div>
  
          {formData.annotation_type === "manual" ? (
            <div className="form-group">
              <label htmlFor="image_text">Your Annotation: </label>
              <textarea
                id="image_text"
                value={formData.image_text}
                onChange={handleChange}
                placeholder="Enter your annotation or quote"
                required
                rows={5}
              />
            </div>
          ) : (
            <div className="form-group">
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
/*
function AnnotationForm({ formType, bookId }) {
    const [formData, setFormData] = useState({
        book: bookId,
        page_number: "",
        image: null,
        image_text: ""
    });

    const [isProcessing, setIsProcessing] = useState(false);
    const [textDetected, setTextDetected] = useState(false);

    const handleChange = (e) => {
        const { id, value } = e.target;
        setFormData({[id]: value});
    };

    const handleImageChange = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFormData({image: e.target.files[0]});
        }
    };

    const handleImageSubmission = async (e) => {
        e.preventDefault();
        setIsProcessing(true);

        try {
            const imageData = new FormData();
            imageData.append('book', bookId);
            imageData.append('image', formData.image);
            if (formData.page_number) {
                imageData.append('page_number', formData.page_number);
            }

            const response = await api.post('annotations/', imageData);

            setFormData({image_text: response.data.image_text});
            setTextDetected(true);
            setIsProcessing(false);
        } catch (error) {
            setIsProcessing(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            if (formType === "manual") {
                const annotationData = new FormData();
                annotationData.append('book', bookId);
                annotationData.append('image_text', formData.image_text);
                if (formData.page_number) {
                    annotationData.append('page_number', formData.page_number);
                }

                await api.post('annotations/', annotationData);
            } else if (formType === "scan" && textDetected) {

            }
        }
    }
 const annotationData = new FormData();
        
        // Add the common fields
        annotationData.append('book', bookId);
        console.log(bookId)
        if (formData.page_number) {
          annotationData.append('page_number', formData.page_number);
        }
        
        // Add type-specific fields
        if (formType === "manual") {
          annotationData.append('annotation_type', 'manual');
          annotationData.append('image_text', formData.image_text);
          console.log(annotationData.get('image'))
        } else {
          annotationData.append('annotation_type', 'scan');
          annotationData.append('image', formData.image);
          annotationData.append('image_text', '');

        }
    return (
        <form onSubmit={handleSubmit} className="auth-form">
            <input
            id="page_number"
            type="number"
            value={formData.page_number}
            onChange={(e) => setFormData.page_number(e.target.value)}
            required
            />

            {formType === "manual" ? (
                <input
                id="image_text"
                type="text"
                value={formData.image_text}
                onChange={(e) => setFormData.image_text(e.target.value)}
                />
            ) : (
                <>
                    <input
                    id="image"
                    type="file"
                    accept="image/*"
                    value={formData.image}
                    onChange={(e) => setFormData.image(e.target.value)}
                    />

                    {textDetected && (
                        <textarea
                        name="image_text"
                        value={formData.image_text}
                        placeholder="Edit detected text if needed"/>
                    )}
                </>
            )}
            <button type="submit">Submit Annotation</button>
        </form>
    );
}

export default AnnotationForm
'''
*/