const mongoose = require("mongoose");

const reservationSchema = new mongoose.Schema({
  ad: {
    type: String,
    required: true,
  },
  soyad: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  telefon: {
    type: String,
    required: true,
  },
  etkinlik: {
    type: String,
    required: true,
  },
  tarih: {
    type: String,
    required: true,
  },
  kisiSayisi: {
    type: Number,
    required: true,
  },
  notlar: {
    type: String,
    default: "",
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

module.exports = mongoose.model("Reservation", reservationSchema);
