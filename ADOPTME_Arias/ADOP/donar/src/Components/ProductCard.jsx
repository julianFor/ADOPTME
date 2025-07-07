import React from 'react';

const ProductCard = ({ product, onDonate }) => {
  return (
    <div className="product-card">
      <div className="product-image-container">
        {product.imageUrl ? (
          <img 
            src={product.imageUrl} 
            alt={product.name}
            className="product-image"
            onError={(e) => {
              e.target.onerror = null; 
              e.target.src = 'https://via.placeholder.com/150?text=Imagen+no+disponible';
            }}
          />
        ) : (
          <div className="placeholder-image">🐾</div>
        )}
      </div>
      
      <h3 className="product-title">{product.name}</h3>
      <button onClick={() => onDonate(product)}>Donar</button>
    </div>
  );
};

export default ProductCard;