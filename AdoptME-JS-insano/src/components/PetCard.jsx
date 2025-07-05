import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const PetCard = ({ pet }) => {
  const navigate = useNavigate();
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageUrl, setImageUrl] = useState('');

  useEffect(() => {
    const getPetImage = () => {
      if (!pet?.photos || pet.photos.length === 0) {
        return '/img/cargando.jpg';
      }

      const photo = pet.photos[0];

      if (typeof photo === 'object' && photo.url) {
        if (photo.url.startsWith('http')) {
          return photo.url;
        }
        return `http://localhost:5000${photo.url.startsWith('/') ? '' : '/'}${photo.url}`;
      }

      if (typeof photo === 'string') {
        return photo.startsWith('http') ? photo : `http://localhost:5000/uploads/pets/${photo}`;
      }

      return '/img/cargando.jpg';
    };

    setImageUrl(getPetImage());
  }, [pet]);

  const handleImageError = (e) => {
    e.target.src = '/img/cargando.jpg';
    setImageLoaded(true);
  };

  const handleImageLoad = () => {
    setImageLoaded(true);
  };

  // Función para obtener la clase CSS según el estado
  const getStatusClass = () => {
    switch(pet.status?.toLowerCase()) {
      case 'adoptado':
        return 'status-adopted';
      case 'en proceso':
        return 'status-in-process';
      case 'disponible':
      default:
        return 'status-available';
    }
  };

  return (
    <div className="pet-card">
      <div className="image-container" style={{ opacity: imageLoaded ? 1 : 0 }}>
        <img 
          src={imageUrl}
          alt={pet.name}
          onLoad={handleImageLoad}
          onError={handleImageError}
          style={{ display: imageLoaded ? 'block' : 'none' }}
        />
        {!imageLoaded && <div className="image-placeholder"></div>}
      </div>
      <div className="pet-info">
        <div className="pet-header">
          <h3>{pet.name}</h3>
          {pet.status && (
            <span className={`status-badge ${getStatusClass()}`}>
              {pet.status}
            </span>
          )}
        </div>
        <p className="species">{pet.species} • {pet.breed}</p>
        <p className="description">
          {pet.description.length > 100 
            ? `${pet.description.substring(0, 100)}...` 
            : pet.description}
        </p>
        <div className="pet-meta">
          <span>{pet.age} {pet.age === 1 ? 'año' : 'años'}</span>
          <span>{pet.gender === 'macho' ? 'Macho' : 'Hembra'}</span>
          <span>{pet.size}</span>
        </div>
        <button 
          className="btn" 
          onClick={() => navigate(`/mascota/${pet._id}`)}
        >
          Conocer más
        </button>
      </div>
    </div>
  );
};

export default PetCard;