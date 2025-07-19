export default function handler(req, res) {
  // Site'i aktif tutmak için basit bir ping
  const now = new Date();
  
  res.status(200).json({
    status: "awake",
    timestamp: now.toISOString(),
    serverTime: now.toLocaleString('tr-TR'),
    message: "Site uyandırıldı ve aktif!",
    uptime: process.uptime ? process.uptime() : 0
  });
} 