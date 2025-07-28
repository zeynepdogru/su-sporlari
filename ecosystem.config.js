module.exports = {
  apps: [
    {
      name: "su-sporlari",
      script: "server.js",
      watch: true,
      ignore_watch: ["node_modules", "logs"],
      env: {
        NODE_ENV: "production",
        PORT: 3000,
        MONGODB_URI: "mongodb://localhost:27017/su_sporlari",
        EMAIL_USER: process.env.EMAIL_USER,
        EMAIL_PASS: process.env.EMAIL_PASS,
      },
      error_file: "logs/err.log",
      out_file: "logs/out.log",
      log_file: "logs/combined.log",
      time: true,
      autorestart: true,
      restart_delay: 4000,
      max_restarts: 10,
    },
  ],
};
