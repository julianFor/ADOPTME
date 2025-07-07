const API_BASE_URL = 'http://localhost:3000'; // Asegúrate de que coincida con el puerto de tu backend

export const createDonation = async (donationData) => {
  const response = await fetch(`${API_BASE_URL}/api/donations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(donationData),
  });
  return await response.json();
};

export const getDonations = async () => {
  const response = await fetch(`${API_BASE_URL}/api/donations`);
  return await response.json();
};