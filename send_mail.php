<?php
use PHPMailer\PHPMailer\PHPMailer;
use PHPMailer\PHPMailer\Exception;

require 'vendor/autoload.php'; // PHPMailer Composer ile kurulduysa

if ($_SERVER["REQUEST_METHOD"] == "POST") {
    $name   = $_POST['name'];
    $email  = $_POST['email'];
    $branch = $_POST['branch'];
    $date   = $_POST['date'];
    $time   = $_POST['time'];

    $mail = new PHPMailer(true);

    try {
        // Sunucu ayarları
        $mail->SMTPDebug = 2; // veya 3
        $mail->isSMTP();                                    
        $mail->Host       = 'smtp.gmail.com';                
        $mail->SMTPAuth   = true;                            
        $mail->Username   = 'zynp11dgru@gmail.com';          // kendi Gmail adresin
        $mail->Password   = 'asxdcnldjqvdsfva';              // oluşturduğun uygulama şifresi
        $mail->SMTPSecure = 'tls';                           
        $mail->Port       = 587;                             

        // Alıcı
        $mail->setFrom('zynp11dgru@gmail.com', 'Ansal Windsurf Rezervasyon');
        $mail->addAddress($email, $name);                    // Kullanıcının girdiği e-posta

        // İçerik
        $mail->isHTML(true);
        $mail->Subject = 'Rezervasyon Onayı';
        $mail->Body    = "
            Merhaba <b>$name</b>,<br><br>
            Rezervasyonunuz alınmıştır.<br><br>
            <b>Branş:</b> $branch <br>
            <b>Tarih:</b> $date <br>
            <b>Saat:</b> $time <br><br>
            Görüşmek üzere!
        ";
        $mail->AltBody = "Rezervasyonunuz alındı. Branş: $branch - Tarih: $date - Saat: $time";

        $mail->send();
        echo "Rezervasyon alındı, e-posta gönderildi.";
    } catch (Exception $e) {
        echo "Mesaj gönderilemedi. Hata: {$mail->ErrorInfo}";
    }
}
?>
