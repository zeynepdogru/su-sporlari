const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');
const Reservation = require('../models/Reservation');

// Tüm rezervasyonları getir
router.get('/', async (req, res) => {
    try {
        const reservations = await Reservation.find().sort({ date: 1, time: 1 });
        res.json(reservations);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Test endpoint
router.get('/test-email', async (req, res) => {
    try {
        console.log('Email gönderme testi başladı...');
        console.log('Email ayarları:', {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS ? 'Şifre mevcut' : 'Şifre eksik'
        });

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('Transporter oluşturuldu');

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.EMAIL_USER,
            subject: 'Test Email',
            text: 'Bu bir test emailidir. Eğer bu maili alıyorsanız, mail sistemi çalışıyor demektir.'
        };

        console.log('Mail gönderiliyor...', {
            from: mailOptions.from,
            to: mailOptions.to
        });

        const info = await transporter.sendMail(mailOptions);
        console.log('Mail gönderildi:', info);

        res.json({ success: true, message: 'Test email gönderildi', info });
    } catch (error) {
        console.error('Test email hatası:', error);
        res.status(500).json({ 
            success: false, 
            error: error.message,
            stack: error.stack
        });
    }
});

// Rezervasyon oluşturma
router.post('/', async (req, res) => {
    try {
        console.log('Rezervasyon isteği alındı:', req.body);
        const { name, email, phone, date, time, activity, participants } = req.body;

        // Aynı tarih ve saatte başka rezervasyon var mı kontrol et
        const existingReservation = await Reservation.findOne({
            date: new Date(date),
            time,
            status: { $ne: 'iptal edildi' }
        });

        if (existingReservation) {
            return res.status(400).json({
                success: false,
                error: 'Bu tarih ve saatte başka bir rezervasyon bulunmaktadır.'
            });
        }

        // Yeni rezervasyon oluştur
        const reservation = await Reservation.create({
            name,
            email,
            phone,
            date: new Date(date),
            time,
            activity,
            participants
        });

        console.log('Rezervasyon veritabanına kaydedildi:', reservation);

        console.log('Email gönderme işlemi başlıyor...');
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        console.log('Transporter oluşturuldu');

        // Admin'e gönderilecek mail
        const adminMailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Yeni Rezervasyon',
            html: `
                <h2>Yeni Rezervasyon Detayları</h2>
                <p><strong>İsim:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Telefon:</strong> ${phone}</p>
                <p><strong>Tarih:</strong> ${date}</p>
                <p><strong>Saat:</strong> ${time}</p>
                <p><strong>Aktivite:</strong> ${activity}</p>
                <p><strong>Katılımcı Sayısı:</strong> ${participants}</p>
            `
        };

        // Müşteriye gönderilecek onay maili
        const customerMailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Rezervasyon Onayı - Ansal WindSurf',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
                    <h2 style="color: #2c3e50;">Rezervasyonunuz Alındı!</h2>
                    <p>Sayın ${name},</p>
                    <p>Rezervasyonunuz başarıyla oluşturuldu. Detaylar aşağıdadır:</p>
                    <div style="background-color: #f8f9fa; padding: 20px; border-radius: 5px; margin: 20px 0;">
                        <p><strong>Aktivite:</strong> ${activity}</p>
                        <p><strong>Tarih:</strong> ${date}</p>
                        <p><strong>Saat:</strong> ${time}</p>
                        <p><strong>Katılımcı Sayısı:</strong> ${participants}</p>
                    </div>
                    <p>Rezervasyonunuzla ilgili herhangi bir sorunuz olursa, lütfen bizimle iletişime geçin.</p>
                    <p>İyi eğlenceler dileriz!</p>
                    <hr style="border: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">
                        Ansal WindSurf<br>
                        📍 Postane, Sahil Yolu Sk. No:32, 34940 Tuzla/İstanbul<br>
                        📞 +90 555 803 11 69
                    </p>
                </div>
            `
        };

        console.log('Mailler gönderiliyor...');
        const adminInfo = await transporter.sendMail(adminMailOptions);
        console.log('Admin maili gönderildi:', adminInfo);
        
        const customerInfo = await transporter.sendMail(customerMailOptions);
        console.log('Müşteri maili gönderildi:', customerInfo);

        res.status(200).json({ 
            success: true,
            message: 'Rezervasyon başarıyla oluşturuldu ve onay maili gönderildi',
            reservation
        });
    } catch (error) {
        console.error('Rezervasyon hatası:', error);
        res.status(500).json({ 
            success: false,
            error: error.message,
            stack: error.stack
        });
    }
});

// Rezervasyon durumunu güncelle
router.patch('/:id', async (req, res) => {
    try {
        const { status } = req.body;
        const reservation = await Reservation.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(reservation);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router; 