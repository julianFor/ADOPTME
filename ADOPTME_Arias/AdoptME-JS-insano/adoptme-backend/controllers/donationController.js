const Donation = require('../models/Donation');

exports.createDonation = async (req, res) => {
  try {
    const donation = new Donation(req.body);
    await donation.save();
    res.status(201).json(donation);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.getTotal = async (req, res) => {
  try {
    const total = await Donation.aggregate([
      { $match: { type: 'dinero' } },
      { $group: { _id: null, total: { $sum: "$amount" } } }
    ]);
    res.json({ total: total[0]?.total || 0 });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
