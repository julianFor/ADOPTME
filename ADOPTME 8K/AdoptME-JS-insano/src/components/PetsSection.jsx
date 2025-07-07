import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const PetsSection = ({ openModal }) => {
  const [featuredPets, setFeaturedPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchFeaturedPets = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/pets?limit=3');
        setFeaturedPets(response.data.pets || []);
      } catch (error) {
        console.error('Error fetching featured pets:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchFeaturedPets();
  }, []);

  const getPetImage = (pet) => {
    if (!pet?.photos || pet.photos.length === 0) {
      return '/img/cargando.jpg';
    }

    const photo = pet.photos[0];
    
    if (typeof photo === 'object' && photo.url) {
      if (photo.url.startsWith('http')) {
        return photo.url;
      }
      return `http://localhost:3000${photo.url.startsWith('/') ? '' : '/'}${photo.url}`;
    }

    if (typeof photo === 'string') {
      return photo.startsWith('http') ? photo : `http://localhost:3000/uploads/pets/${photo}`;
    }

    return '/img/cargando.jpg';
  };

  if (loading) return <div className="loading">Cargando mascotas destacadas...</div>;

  return (
    <section className="pets">
      <h2>Peluditos Disponibles</h2>
      <div className="carousel">
        {featuredPets.map((pet) => (
          <div className="pet-card" key={pet._id}>
            <img
              src={getPetImage(pet)}
              alt={pet.name}
              onError={(e) => {
                e.target.src = '/img/cargando.jpg';
              }}
            />
            <h3>{pet.name}</h3>
            <p>{pet.description.substring(0, 50)}...</p>
            <button
              className="btn"
              onClick={() => navigate(`/mascota/${pet._id}`)}
            >
              Adoptar
            </button>
          </div>
        ))}
      </div>
      <div className="see-more">
        <button className="btn" onClick={() => navigate('/adoptar')}>
          Ver más mascotas
        </button>
      </div>
    </section>
  );
};

export default PetsSection;