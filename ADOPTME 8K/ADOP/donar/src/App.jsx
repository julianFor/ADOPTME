import React, { useState } from 'react';
import ProductCard from './Components/ProductCard';
import DonationForm from './Components/DonationForm';
import './App.css';

const App = () => {
  const [showForm, setShowForm] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  
 const products = [
    { 
      id: 1, 
      name: 'Comida seca', 
      imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.Vg22-cB6Jd-sWpHy3CFPeQHaHa?pid=Api&P=0&h=180' 
    },
    { 
      id: 2, 
      name: 'Comida húmeda', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.HApdCYxy3A7Ixw_Sal7qQwHaF0?pid=Api&P=0&h=180' 
    },
    { 
      id: 3, 
      name: 'Arenero', 
      imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.OsBSSIs0__fAWkZLAaxXtQHaHa?pid=Api&P=0&h=180' 
    },
    { 
      id: 4, 
      name: 'Arena sanitaria', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.0huLfpe_aRt4osYlqhVFDwHaHa?pid=Api&P=0&h=180' 
    },
    { 
      id: 5, 
      name: 'Cama', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.0u02JG-bxRc9tbZP_O97rgHaDt?pid=Api&P=0&h=180' 
    },
    { 
      id: 6, 
      name: 'Transportadora', 
      imageUrl: 'https://tse1.mm.bing.net/th/id/OIP.6e_K0B6c2ydQAhRl__WUFwHaHs?pid=Api&P=0&h=180' 
    },
    { 
      id: 7, 
      name: 'Juguetes', 
      imageUrl: 'https://tse3.mm.bing.net/th/id/OIP.y1wRYJp3ZeqmJ17F-Uf7NQHaHa?pid=Api&P=0&h=180' 
    },
    { 
      id: 8, 
      name: 'Rascador', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP._IBEVi9qjFOkp2nJ-K1uZgHaHa?pid=Api&P=0&h=180' 
    },
    { 
      id: 9, 
      name: 'Torre para gatos', 
      imageUrl: '' 
    },
    { 
      id: 10, 
      name: 'Cepillo', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.60KIVlYSnBz5tY1HAEfefwHaGT?pid=Api&P=0&h=180' 
    },
    { 
      id: 11, 
      name: 'Shampoo', 
      imageUrl: 'https://tse4.mm.bing.net/th/id/OIP.60KIVlYSnBz5tY1HAEfefwHaGT?pid=Api&P=0&h=180' 
    },
    { 
      id: 12, 
      name: 'Cortauñas', 
      imageUrl: 'https://tse2.mm.bing.net/th/id/OIP.xGHxycEyEXAUbJhovanz8QHaHa?pid=Api&P=0&h=180' 
    }
  ];
    
  const handleDonate = (product) => {
    setSelectedProduct(product);
    setShowForm(true);
  };

  const handleSubmitDonation = async (donationData) => {
    try {
      const response = await fetch('http://localhost:3000/api/donations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          product: donationData.product.name,
          firstName: donationData.firstName,
          lastName: donationData.lastName,
          email: donationData.email,
          phone: donationData.phone
        })
      });

      if (!response.ok) throw new Error('Error en la respuesta del servidor');
      
      const result = await response.json();
      alert(`¡Gracias por donar ${donationData.product.name}! (ID: ${result._id})`);
      setShowForm(false);
      
    } catch (error) {
      console.error('Error al enviar donación:', error);
      alert('Error al procesar la donación');
    }
  };


  return (
    <div className="app">
      <header>
        <h1>Artículos esenciales para nuestra fundación</h1>
        <p>Ayuda a nuestra fundación donando estos artículos, nuestros amigos peludos te lo agradecerán</p>
      </header>
      
      <div className="products-grid">
        {products.map(product => (
          <ProductCard 
            key={product.id} 
            product={product} 
            onDonate={handleDonate} 
          />
        ))}
      </div>
      
      {showForm && (
        <DonationForm 
          product={selectedProduct} 
          onClose={() => setShowForm(false)} 
          onSubmit={handleSubmitDonation} 
        />
      )}
    </div>
  );
};

export default App;