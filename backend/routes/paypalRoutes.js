const express = require('express');
const router = express.Router();
const axios = require('axios');
const Donation = require('../models/Donation');
const DonationGoal = require('../models/DonationGoal');

router.post('/ipn', async (req, res) => {
  const body = req.body;
  const verification = `cmd=_notify-validate&${new URLSearchParams(body).toString()}`;

  try {
    const paypalRes = await axios.post(
      'https://ipnpb.sandbox.paypal.com/cgi-bin/webscr', // sandbox para pruebas
      verification,
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
        },
      }
    );

    if (paypalRes.data === 'VERIFIED') {
      const { payer_email, mc_gross, item_name, payment_status } = body;

      if (payment_status === 'Completed') {
        // Buscar la meta activa más reciente
        const metaActiva = await DonationGoal.findOne({ activa: true }).sort({ createdAt: -1 });

        if (!metaActiva) {
          console.warn("⚠️ No hay meta activa. No se puede asociar la donación.");
          return res.sendStatus(400);
        }

        const donacion = new Donation({
          nombre: item_name || 'Donante anónimo',
          monto: mc_gross,
          tipo: 'dinero',
          descripcion: `Donación vía PayPal de ${payer_email}`,
          goalId: metaActiva._id
        });

        await donacion.save();
        console.log("✅ Donación registrada desde PayPal:", donacion);
      }
    }

    res.sendStatus(200); // PayPal requiere 200 OK
  } catch (error) {
    console.error("❌ Error verificando IPN:", error.message);
    res.sendStatus(500);
  }
});

module.exports = router;
