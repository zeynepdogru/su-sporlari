const express = require('express');
const router = express.Router();
const nodemailer = require('nodemailer');

// İletişim formu gönderme
router.post('/', async (req, res) => {
    try {
        const { name, email, message } = req.body;

        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: process.env.ADMIN_EMAIL,
            subject: 'Yeni İletişim Formu Mesajı',
            html: `
                <h2>Yeni İletişim Formu Mesajı</h2>
                <p><strong>İsim:</strong> ${name}</p>
                <p><strong>Email:</strong> ${email}</p>
                <p><strong>Mesaj:</strong> ${message}</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(200).json({ message: 'Mesajınız başarıyla gönderildi' });
    } catch (error) {
        console.error('İletişim formu hatası:', error);
        res.status(500).json({ error: 'Mesaj gönderilirken bir hata oluştu' });
    }
});

module.exports = router; 