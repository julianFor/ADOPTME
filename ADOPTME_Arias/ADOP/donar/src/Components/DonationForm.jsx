import React, { useState } from 'react';

const DonationForm = ({ product, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    photo: null
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, photo: e.target.files[0] }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit({ ...formData, product });
  };

  return (
    <div className="donation-form-overlay">
      <div className="donation-form">
        <h2>Donar {product.name}</h2>
        <button className="close-btn" onClick={onClose}>×</button>
        
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Nombre:</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Apellido:</label>
            <input 
              type="text" 
              name="lastName" 
              value={formData.lastName} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Correo electrónico:</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Teléfono:</label>
            <input 
              type="tel" 
              name="phone" 
              value={formData.phone} 
              onChange={handleChange} 
              required 
            />
          </div>
          
          <div className="form-group">
            <label>Foto :</label>
            <input 
              type="file" 
              accept="image/*" 
              onChange={handleFileChange} 
            />
          </div>
          
          <button type="submit">Enviar</button>
        </form>
      </div>
    </div>
  );
};

export default DonationForm;