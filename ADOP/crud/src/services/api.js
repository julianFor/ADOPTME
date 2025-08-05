import axios from 'axios';

const API_URL = 'http://localhost:3000/api';  // Agregado /api

export const getDonations = async () => {
  const response = await axios.get(`${API_URL}/donations`);
  return response.data;
};

export const createDonation = async (donationData) => {
  const response = await axios.post(`${API_URL}/donations`, donationData);
  return response.data;
};