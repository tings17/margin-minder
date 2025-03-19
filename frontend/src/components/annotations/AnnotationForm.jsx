import { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../api";

function AnnotationForm({ formType, bookId }) {
    const [formData, setFormData] = useState({
      book: bookId,
      page_number: "",
      image: null,
      image_text: "",
      annotation_type: formType,
      highlighter_color: "",
    });
  
    const [isProcessing, setIsProcessing] = useState(false);
    const [textDetected, setTextDetected] = useState(false);
    const [annotationId, setAnnotationId] = useState(null);
    const [highlightColor, setHighlightColor] = useState("");
    // const [error, setError] = useState(null);

    const [errors, setErrors] = useState({
      general: null,
      page_number: null,
      image_text: null,
      image: null,
      highlighter_color: null
    });

    const navigate = useNavigate();

    const handleChange = (e) => {
      const { id, value } = e.target;
      setFormData({
        ...formData,
        [id]: value
      });

      if (errors[id]) {
        setErrors({
          ...errors,
          [id]: null
        });
      }
    };

    const handleColorChange = (e) => {
      const color = e.target.value;
      setHighlightColor(color);
      setFormData({
        ...formData,
        highlighter_color: color
      });

      if (errors.highlighter_color) {
        setErrors({
          ...errors,
          highlighter_color: null
        });
      }
    }

    const handleFileChange = (e) => {
      if (e.target.files && e.target.files[0]) {
        setFormData({
          ...formData,
        image: e.target.files[0]
        });

        if (errors.image) {
          setErrors({
            ...errors,
            image: null
          });
        }
      }
    };

    const validateForm = () => {
      const newErrors = {
        general: null,
        page_number: null,
        image_text: null,
        image: null,
        highlighter_color: null
      };
      
      let isValid = true;
      
      // page number empty
      if (!formData.page_number || formData.page_number === "") {
        newErrors.page_number = "Please enter the page number.";
        isValid = false;
      }

      // empty annotation field
      if (formData.annotation_type === "manual" && (!formData.image_text || formData.image_text === "")) {
        newErrors.image_text = "Please enter the annotation.";
        isValid = false;
      }
      
      // image and highlighter color (for scan only)
      if (formData.annotation_type === "scan" && !textDetected) {
        if (!formData.image) {
          newErrors.image = "Please upload a scan of the page.";
          isValid = false;
        }
        
        if (!formData.highlighter_color || formData.highlighter_color === "") {
          newErrors.highlighter_color = "Please select a highlighter color.";
          isValid = false;
        }
      }
      
      setErrors(newErrors);
      return isValid;
    };
  
    const handleSubmit = async (e) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      setIsProcessing(true);
      setErrors({ ...errors, general: null });
      
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
            setFormData({...formData, image_text: response.data.image_text, annotation_type: "manual", highlighter_color: highlightColor});
            setTextDetected(true);
          } else {
            navigate(`/books/${bookId}/annotations/`,  { state: { bookId: bookId }});
          }
        }      
        setIsProcessing(false);
      } catch (error) {
        setIsProcessing(false);
        setErrors({
          ...errors,
          general: "Failed to create annotation: " + error.message
        });
      }
    };
  
    return (
      <div className="form-base">
        <h1>{formData.annotation_type === "manual" ? (!textDetected ? "Add Manual Annotation" : "Edit Your Annotation") : "Add Annotation from Image"}</h1>
        
        {errors.general && <div className="message">{errors.general}</div>}
        
        <form onSubmit={handleSubmit}>
          <div className="input-box">
            <input
              id="page_number"
              type="number"
              value={formData.page_number}
              onChange={handleChange}
              placeholder="Enter page number"
            />
            {errors.page_number && <div className="field-error">{errors.page_number}</div>}
          </div>
  
          {formData.annotation_type === "manual" ? (
            <div className="input-box">
              <textarea
                id="image_text"
                value={formData.image_text}
                onChange={handleChange}
                placeholder="Enter your annotation"
                //required
                rows={5}
              />
              {errors.image_text && <div className="field-error">{errors.image_text}</div>}
            </div>
          ) : (
            <>
            <label className="highlighter-label" htmlFor="highlighter-group">Choose your highlighter color: </label>
            <div id="highlighter-group" className="highlighter-box">
              <input className="radio-button" type="radio" id="yellow" value="yellow" checked={highlightColor == "yellow"} onChange={handleColorChange}/>
              <label className="yellow-label" htmlFor="yellow">Yellow</label>
              <input className="radio-button" type="radio" id="pink" value="pink" checked={highlightColor == "pink"} onChange={handleColorChange}/>
              <label className="pink-label" htmlFor="pink">Pink</label>
              <input className="radio-button" type="radio" id="blue" value="blue" checked={highlightColor == "blue"} onChange={handleColorChange}/>
              <label className="blue-label" htmlFor="blue">Blue</label>
            </div>
            {errors.highlighter_color && <div className="field-error">{errors.highlighter_color}</div>}
            
            <div className="input-box">
            <label htmlFor="image">Upload Image with Highlighted Text: </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                //required
                disabled={textDetected}
              />
              {errors.image && <div className="field-error">{errors.image}</div>}
              {textDetected && (
                <textarea
                id='image_text'
                value={formData.image_text}
                onChange={handleChange}/>
              )}
            </div>
            {errors.image_text && <div className="field-error">{errors.image_text}</div>}

            </>
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