const BloodBank = require("../models/BloodBank");

exports.addBloodBank = async (req, res) => {
  try {
    const { name, address, city, phone, website, type } = req.body;
    
    // Basic validation
    if (!name || !address || !city || !phone) {
        return res.status(400).json({ message: "Please fill required fields" });
    }

    const newBank = await BloodBank.create({
      name,
      address,
      city,
      phone,
      website,
      type,
      addedBy: req.user.id
    });

    res.status(201).json(newBank);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Failed to add blood bank" });
  }
};

exports.getBloodBanks = async (req, res) => {
  try {
    const { city } = req.query;
    let query = {};
    if (city) {
        query.city = { $regex: city, $options: "i" };
    }
    const banks = await BloodBank.find(query).sort({ createdAt: -1 });
    res.json(banks);
  } catch (err) {
    res.status(500).json({ message: "Failed to fetch blood banks" });
  }
};

exports.deleteBloodBank = async (req, res) => {
    try {
        const bank = await BloodBank.findById(req.params.id);
        if (!bank) return res.status(404).json({ message: "Blood bank not found" });

        // Check if user is the owner (addedBy)
        if (bank.addedBy.toString() !== req.user.id) {
            return res.status(403).json({ message: "Not authorized to delete this blood bank" });
        }

        await bank.deleteOne();
        res.json({ message: "Blood Bank deleted successfully" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: "Failed to delete blood bank" });
    }
};
