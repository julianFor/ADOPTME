import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Adoptrar from '../pages/Adoptar';
import ComoAdoptar from '../pages/ComoAdoptar';
import Formulario from '../pages/Formulario';
import Formulario2 from '../pages/Formulario2';
import Mascota from '../pages/Mascota';
import Header from '../components/Header';
import Footer from '../components/Footer';

export default function AppRouter() {
  return (
    <Router>
      <Header />
      <main>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/adoptar" element={<Adoptrar />} />
          <Route path="/como-adoptar" element={<ComoAdoptar />} />
          <Route path="/formulario" element={<Formulario />} />
          <Route path="/formulario2" element={<Formulario2 />} />
          <Route path="/mascota/:id" element={<Mascota />} />
        </Routes>
      </main>
      <Footer />
    </Router>
  );
}
