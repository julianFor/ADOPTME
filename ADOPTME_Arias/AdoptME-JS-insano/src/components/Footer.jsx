import React from 'react';

function Footer() {
  return (
    <footer>
      <div className="footer-content">
        <div className="about">
          <h3>AdoptMe</h3>
          <p>
            En AdoptMe, conectamos corazones con patas. Facilitamos adopciones
            seguras y responsables para que encuentres un hogar lleno de amor.
          </p>
          <p>📧 Adoptme@gmail.com</p>
          <p>📞 +57 302 452 9227</p>
          <div className="social-icons">
            <a href="https://www.facebook.com/share/1C9GbksDEm/">
              <img src="../img/FacebookLogo.png" alt="Facebook" />
            </a>
            <a href="https://www.instagram.com/la.gaticueva?igsh=MW8xaG5hMWwzYnV5aA==">
              <img src="../img/InstagramLogo.png" alt="Instagram" />
            </a>
            <a href="#">
              <img src="../img/LinkedinLogo.png" alt="LinkedIn" />
            </a>
          </div>
        </div>

        <div className="footer-image">
          <img src="../img/footer.png" alt="Imagen central" />
        </div>

        <div className="menu">
          <h3>Menu</h3>
          <ul>
            <li><a href="http://localhost:5173/">Home</a></li>
            <li><a href="./Adoptar">Adopta</a></li>
            <li><a href="/ComoAdoptar">¿Cómo Adoptar?</a></li>
            <li><a href="/Donar">Donar</a></li>
          </ul>
        </div>
      </div>
      <p className="copyright">© 2025 AdoptMe. Todos los derechos reservados. Adoptar es amar.</p>
    </footer>
  );
}

export default Footer;
