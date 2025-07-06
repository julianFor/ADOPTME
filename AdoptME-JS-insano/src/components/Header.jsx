import React from 'react'
import { Link } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSignOutAlt } from '@fortawesome/free-solid-svg-icons';

function Header({ openModal, isAuthenticated, user, onLogout }) {
  return (
    <header>
      <div className="logo">
        <Link to="/">
          <img src="/img/logo.png" alt="AdoptMe Logo" />
        </Link>
      </div>
      <nav>
        <ul>
          <li><Link to="/">Inicio</Link></li>
          <li><Link to="/Adoptar">Adoptar</Link></li>
          <li><Link to="/ComoAdoptar">¿Cómo Adoptar?</Link></li>
          <li><Link to="/Donar">Donar</Link></li>
        </ul>
      </nav>
      {isAuthenticated ? (
        <div className="user-controls">
          <span className="user-greeting">
            Hola, {user?.name || user?.email.split('@')[0]}
          </span>
          <button
            onClick={onLogout}
            className="logout-button"
            aria-label="Cerrar sesión"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: '#ff4d4f',
              color: '#fff',
              border: 'none',
              borderRadius: '4px',
              padding: '8px 16px',
              cursor: 'pointer',
              fontWeight: 'bold',
              transition: 'background 0.2s'
            }}
            onMouseOver={e => e.currentTarget.style.background = '#d9363e'}
            onMouseOut={e => e.currentTarget.style.background = '#ff4d4f'}
          >
            <FontAwesomeIcon icon={faSignOutAlt} className="icon" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      ) : (
        <button className="btn login-button" onClick={() => openModal('login')}>
          Iniciar Sesión
        </button>
      )}
    </header>
  )
}

export default Header
