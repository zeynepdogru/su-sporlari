const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Atlas bağlantısı
const MONGODB_URI =
  process.env.MONGODB_URI ||
  "mongodb+srv://zynp11dgru:zynp11dgru@cluster0.mongodb.net/su-sporlari?retryWrites=true&w=majority";

mongoose
  .connect(MONGODB_URI)
  .then(() => console.log("MongoDB Atlas bağlantısı başarılı"))
  .catch((err) => console.error("MongoDB bağlantı hatası:", err));

// Ana sayfa route'u
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// Rezervasyon sayfası route'u
app.get("/rezervasyon", (req, res) => {
  res.sendFile(path.join(__dirname, "rezervasyon.html"));
});

// Rezervasyon şeması
const reservationSchema = new mongoose.Schema({
  name: String,
  email: String,
  phone: String,
  branch: String,
  date: String,
  time: String,
  people: Number,
  notes: String,
  createdAt: { type: Date, default: Date.now },
});

const Reservation = mongoose.model("Reservation", reservationSchema);

// API endpoint'leri
app.post("/api/reservations", async (req, res) => {
  try {
    // Yeni rezervasyonu kaydet
    const newReservation = new Reservation(req.body);
    await newReservation.save();

    // Bugünün tarihini al
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Bugün ve gelecek tarihteki rezervasyonları getir
    const allReservations = await Reservation.find({
      $or: [
        // Bugünün rezervasyonları
        {
          date: today.toISOString().split("T")[0],
        },
        // Gelecek tarihteki rezervasyonlar
        {
          date: { $gt: today.toISOString().split("T")[0] },
        },
      ],
    }).sort({ date: 1, time: 1 }); // Tarih ve saate göre sırala

    res.json({
      success: true,
      reservations: allReservations,
    });
  } catch (error) {
    console.error("Rezervasyon kaydedilirken hata:", error);
    res.status(500).json({
      success: false,
      error: "Rezervasyon kaydedilemedi",
    });
  }
});

// Server'ı başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
