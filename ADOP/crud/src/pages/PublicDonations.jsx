import React, { useEffect, useState } from 'react';
import DonationTable from '../components/DonationTable';
import { getDonations } from '../services/api';
import '../styles/PublicDonations.css';

const PublicDonations = () => {
  const [donations, setDonations] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      const data = await getDonations();
      setDonations(data);
    };
    fetchData();
  }, []);

  return (
    <div className="public-container">
      <h1>Objetos Donados</h1>
      <DonationTable donations={donations} />
    </div>
  );
};

export default PublicDonations;