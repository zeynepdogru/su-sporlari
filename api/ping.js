export default function handler(req, res) {
  res.status(200).json({
    status: "alive",
    timestamp: new Date().toISOString(),
    uptime: process.uptime ? process.uptime() : 0,
    message: "Site aktif ve çalışıyor!",
  });
}
