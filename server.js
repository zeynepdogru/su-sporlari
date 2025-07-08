require("dotenv").config();
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const app = express();

// Middleware
app.use(cors());
app.use(express.json());
// Statik dosyalar (CSS, JS, images) ve HTML için public klasörünü kök olarak ayarla
app.use(express.static(path.join(__dirname, "public")));

// MongoDB Atlas bağlantısı
const MONGODB_URI = process.env.MONGODB_URI;

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    console.log("MongoDB Atlas bağlantısı başarılı");
  })
  .catch((err) => {
    console.error("MongoDB bağlantı hatası:", err);
    process.exit(1);
  });

// Ana sayfa route'u
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/index.html"));
});

// Diğer HTML sayfaları için yönlendirmeler
app.get("/surf", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/surf.html"));
});
app.get("/sup", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/sup.html"));
});
app.get("/kano", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/kano.html"));
});
app.get("/rezervasyon", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/rezervasyon.html"));
});
app.get("/galeri", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/galeri.html"));
});
app.get("/hakkimizda", (req, res) => {
  res.sendFile(path.join(__dirname, "public/html/hakkimizda.html"));
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
    console.log("Gelen rezervasyon verisi:", req.body); // Debug için log

    // Yeni rezervasyonu kaydet
    const newReservation = new Reservation(req.body);
    const savedReservation = await newReservation.save();
    console.log("Rezervasyon kaydedildi:", savedReservation); // Debug için log

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
    }).sort({ date: 1, time: 1 });

    console.log("Bulunan rezervasyonlar:", allReservations); // Debug için log

    res.json({
      success: true,
      reservations: allReservations,
    });
  } catch (error) {
    console.error("Rezervasyon kaydedilirken hata:", error);
    res.status(500).json({
      success: false,
      error: "Rezervasyon kaydedilemedi",
      details: error.message,
      stack: error.stack, // Hata stack trace'ini de gönder
    });
  }
});

// Server'ı başlat
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server ${PORT} portunda çalışıyor`);
});
