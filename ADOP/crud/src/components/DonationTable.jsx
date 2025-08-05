import React, { useState } from 'react';

const DonationTable = ({ donations }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterField, setFilterField] = useState('firstName'); // Campo por defecto para buscar

  // Función para manejar errores de imágenes
  const handleImageError = (e) => {
    e.target.src = 'https://via.placeholder.com/150?text=Sin+imagen';
  };

  // Filtramos las donaciones según el término de búsqueda
  const filteredDonations = donations.filter(donation => {
    const fieldValue = String(donation[filterField]).toLowerCase();
    return fieldValue.includes(searchTerm.toLowerCase());
  });

  // Campos disponibles para buscar
  const searchFields = [
    { value: 'firstName', label: 'Nombre' },
    { value: 'lastName', label: 'Apellido' },
    { value: 'email', label: 'Correo' },
    { value: 'phone', label: 'Teléfono' },
    { value: 'product', label: 'Producto' }
  ];

  return (
    <div className="donation-container">
      {/* Barra de búsqueda */}
      <div className="search-bar">
        <input
          type="text"
          placeholder={`Buscar por ${searchFields.find(f => f.value === filterField)?.label || ''}...`}
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="search-input"
        />
        
        <select
          value={filterField}
          onChange={(e) => setFilterField(e.target.value)}
          className="search-select"
        >
          {searchFields.map(field => (
            <option key={field.value} value={field.value}>
              {field.label}
            </option>
          ))}
        </select>
        
        <button 
          onClick={() => setSearchTerm('')}
          className="clear-button"
        >
          Limpiar
        </button>
      </div>

      {/* Tabla de donaciones */}
      <table className="donation-table">
        <thead>
          <tr>
            <th>Foto</th>
            <th>Nombre</th>
            <th>Apellido</th>
            <th>Correo</th>
            <th>Teléfono</th>
          </tr>
        </thead>
        <tbody>
          {filteredDonations.map((donation) => (
            <tr key={donation._id}>
              <td>
                {donation.photo ? (
                  <img 
                    src={`http://localhost:3000${donation.photo}`}
                    alt={`${donation.firstName} ${donation.lastName}`}
                    className="donation-photo"
                    onError={handleImageError}
                  />
                ) : (
                  <div className="no-photo">🖼️</div>
                )}
              </td>
              <td>{donation.firstName}</td>
              <td>{donation.lastName}</td>
              <td>{donation.email}</td>
              <td>{donation.phone}</td>
            </tr>
          ))}
        </tbody>
      </table>
      
      {filteredDonations.length === 0 && (
        <div className="no-results">
          No se encontraron donaciones que coincidan con "{searchTerm}"
        </div>
      )}
    </div>
  );
};

export default DonationTable;