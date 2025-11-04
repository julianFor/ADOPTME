// src/components/ConfirmModal.jsx
import React from 'react';
import PropTypes from 'prop-types';

const ConfirmModal = ({ isOpen, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <p className="mb-4 text-gray-700">{message}</p>
        <div className="flex justify-end gap-4">
          <button
            onClick={onCancel}
            className="px-4 py-2 border rounded hover:bg-gray-100"
          >
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
          >
            Eliminar
          </button>
        </div>
      </div>
    </div>
  );
};

// Validación de props con prop-types
ConfirmModal.propTypes = {
  isOpen: PropTypes.bool.isRequired,      // Controla si el modal está abierto
  message: PropTypes.string.isRequired,   // Mensaje que se mostrará en el modal
  onConfirm: PropTypes.func.isRequired,   // Función a ejecutar al confirmar
  onCancel: PropTypes.func.isRequired,    // Función a ejecutar al cancelar
};

export default ConfirmModal;
