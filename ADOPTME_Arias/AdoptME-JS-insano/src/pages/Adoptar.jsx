import React, { useEffect, useState, useCallback } from 'react';
import Filtros from '../components/Filtros';
import PetCard from '../components/PetCard';
import Paginacion from '../components/Paginacion';
import axios from 'axios';
import '../styles/Adoptar.css';

const Adoptar = () => {
  const [pets, setPets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
    size: '',
    age: 0
  });

  const fetchPets = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (filters.species) params.append('species', filters.species);
      if (filters.gender) params.append('gender', filters.gender);
      if (filters.size) params.append('size', filters.size);
      if (filters.age) params.append('age', filters.age);

      const response = await axios.get(`http://localhost:5000/api/pets?${params.toString()}`);
      setPets(response.data.pets || []);
    } catch (error) {
      console.error('Error fetching pets:', error);
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchPets();
  }, [fetchPets]);

  const handleFilterChange = (newFilters) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
  };

  if (loading) return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Cargando mascotas...</p>
    </div>
  );

  return (
    <div className="adoptar-page">
      <h1 className="title">Peluditos Disponibles</h1>
      <div className="container">
        <Filtros onFilterChange={handleFilterChange} />
        <section className="pets-grid">
          {pets.length > 0 ? (
            pets.map((pet) => (
              <PetCard key={pet._id} pet={pet} />
            ))
          ) : (
            <div className="no-pets-message">
              <img src="/img/cargando.jpg" alt="No hay mascotas" />
              <p>No hay mascotas disponibles con estos filtros</p>
            </div>
          )}
        </section>
      </div>
      {pets.length > 0 && <Paginacion />}
    </div>
  );
};

export default Adoptar;