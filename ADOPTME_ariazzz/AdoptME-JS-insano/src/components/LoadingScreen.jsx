import React from 'react';
import styled, { keyframes } from 'styled-components';

// Animación del spinner
const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

// Estilos con styled-components
const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #f8f9fa;
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 9999;
`;

const Spinner = styled.div`
  width: 50px;
  height: 50px;
  border: 5px solid #f3f3f3;
  border-top: 5px solid #3498db;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const LoadingText = styled.p`
  margin-top: 20px;
  font-size: 1.2rem;
  color: #333;
  font-family: 'Arial', sans-serif;
`;

const LoadingScreen = () => {
  return (
    <LoadingContainer>
      <Spinner />
      <LoadingText>Cargando aplicación...</LoadingText>
    </LoadingContainer>
  );
};

export default LoadingScreen;