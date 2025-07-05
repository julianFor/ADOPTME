import React, { useState } from 'react';

const Filtros = ({ onFilterChange }) => {
  const [filters, setFilters] = useState({
    species: '',
    gender: '',
    size: '',
    age: 0
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === 'checkbox' ? (checked ? value : '') : value;
    
    const newFilters = {
      ...filters,
      [name]: newValue
    };
    
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  return (
    <aside className="filters">
      <h3>Filtrar por:</h3>

      <div className="filter-group">
        <h3>Especie</h3>
        <select name="species" onChange={handleChange}>
          <option value="">Todas</option>
          <option value="Gato">Gato</option>
          <option value="Perro">Perro</option>
          <option value="Ave">Ave</option>
          <option value="Conejo">Conejo</option>
        </select>
      </div>

      <div className="filter-group">
        <h3>Sexo</h3>
        <label>
          <input 
            type="checkbox" 
            name="gender" 
            value="macho" 
            checked={filters.gender === 'macho'}
            onChange={handleChange}
          /> Macho
        </label>
        <label>
          <input 
            type="checkbox" 
            name="gender" 
            value="hembra" 
            checked={filters.gender === 'hembra'}
            onChange={handleChange}
          /> Hembra
        </label>
      </div>

      <div className="filter-group">
        <h3>Tamaño</h3>
        <label>
          <input 
            type="checkbox" 
            name="size" 
            value="pequeño" 
            checked={filters.size === 'pequeño'}
            onChange={handleChange}
          /> Pequeño
        </label>
        <label>
          <input 
            type="checkbox" 
            name="size" 
            value="mediano" 
            checked={filters.size === 'mediano'}
            onChange={handleChange}
          /> Mediano
        </label>
        <label>
          <input 
            type="checkbox" 
            name="size" 
            value="grande" 
            checked={filters.size === 'grande'}
            onChange={handleChange}
          /> Grande
        </label>
      </div>

      <div className="filter-group">
        <h3>Edad Máxima</h3>
        <div className="slider-container">
          <input 
            type="range" 
            name="age"
            min="0" 
            max="15" 
            value={filters.age}
            onChange={handleChange}
          />
          <div className="range-labels">
            <span>{filters.age} años</span>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Filtros;