import express from 'express';
import Donation from '../models/Donation.js';

const router = express.Router();

// Crear donación
router.post('/', async (req, res) => {
  try {
    const newDonation = new Donation(req.body);
    const savedDonation = await newDonation.save();
    res.status(201).json(savedDonation);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
});

// Obtener todas las donaciones
router.get('/', async (req, res) => {
  try {
    const donations = await Donation.find();
    res.json(donations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

export default router;