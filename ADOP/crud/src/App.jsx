import { Routes, Route } from 'react-router-dom';
import PublicDonations from './pages/PublicDonations';

function App() {
  return (
    <Routes>
      <Route path="/" element={<PublicDonations />} />
    </Routes>
  );
}

export default App;