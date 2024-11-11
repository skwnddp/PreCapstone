import React from 'react';

const TextareaComponent = () => {
    return (
      <div>
        <textarea 
          id="temp" 
          placeholder="(Latitude, Longitude)"
          rows="5"
          style={{ width: "100%" }}
        />
      </div>
    );
  };
  
  export default TextareaComponent;