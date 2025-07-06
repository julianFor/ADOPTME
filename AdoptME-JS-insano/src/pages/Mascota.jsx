import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import axios from 'axios';
import '../styles/Mascota.css';

const Mascota = () => {
  const { id } = useParams();
  const [pet, setPet] = useState(null);
  const [loading, setLoading] = useState(true);
  const [relatedPets, setRelatedPets] = useState([]);

  useEffect(() => {
    const fetchPetData = async () => {
      try {
        const petResponse = await axios.get(`http://localhost:5000/api/pets/${id}`);
        setPet(petResponse.data.pet);

        const relatedResponse = await axios.get(
          `http://localhost:5000/api/pets?species=${petResponse.data.pet.species}&limit=3`
        );
        setRelatedPets(relatedResponse.data.pets || []);
      } catch (error) {
        console.error('Error fetching pet:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPetData();
  }, [id]);

  const getPetImage = (petData) => {
    if (!petData?.photos || petData.photos.length === 0) {
      return '/img/cargando.jpg';
    }

    const photo = petData.photos[0];
    
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

  if (loading) return <div className="loading">Cargando mascota...</div>;
  if (!pet) return <div className="error">Mascota no encontrada</div>;

  return (
    <div className="mascota-container">
      <section className="presentacion">
        <h2>Presentación de Mascota</h2>
        <div className="mascota-details">
          <div className="imagen">
            <img
              src={getPetImage(pet)}
              alt={pet.name}
              onError={(e) => {
                e.target.src = '/img/cargando.jpg';
              }}
            />
          </div>
          <div className="info">
            <h3>Hola, mi nombre es <span className="nombre">{pet.name}</span></h3>
            <p><strong>Especie:</strong> {pet.species}</p>
            <p><strong>Raza:</strong> {pet.breed}</p>
            <p><strong>Descripción:</strong> {pet.description}</p>
            <p><strong>Ubicación:</strong> {pet.location}</p>
            
            <div className="tags">
              <div className="tag">
                <strong>{pet.gender === 'macho' ? 'Macho' : 'Hembra'}</strong>
                <span>Sexo</span>
              </div>
              <div className="tag">
                <strong>{pet.age} años</strong>
                <span>Edad</span>
              </div>
              <div className="tag">
                <strong>{pet.size}</strong>
                <span>Tamaño</span>
              </div>
              <div className="tag">
                <strong>{pet.status}</strong>
                <span>Estado</span>
              </div>
            </div>
            
            <Link to={`/formulario/${pet._id}`}>
              <button className="btn-adoptar">Adoptar</button>
            </Link>
          </div>
        </div>
      </section>

      {relatedPets.length > 0 && (
        <section className="mas-peludos">
          <h2>Conoce a más {pet.species.toLowerCase()}s</h2>
          <div className="peluditos-container">
            {relatedPets.map((relatedPet) => (
              <div key={relatedPet._id} className="peludito-card">
                <img
                  src={getPetImage(relatedPet)}
                  alt={relatedPet.name}
                  onError={(e) => {
                    e.target.src = '/img/cargando.jpg';
                  }}
                />
                <h4>{relatedPet.name}</h4>
                <Link to={`/mascota/${relatedPet._id}`}>
                  <button className="btn">Ver más</button>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
};

export default Mascota;