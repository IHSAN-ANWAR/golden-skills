module.exports = {
  apps: [
    {
      name: 'golden-skills-api',
      script: 'server.js',

      // ── Cluster mode — Local MongoDB has no connection limits ──
      instances: 'max',   // Use all CPU cores for optimal performance
      exec_mode: 'cluster',

      // ── Environment ────────────────────────────────────────────────────────
      env: {
        NODE_ENV: 'development',
        PORT: 5000,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 5000,
        // Note: Sensitive values should be loaded from .env file
        // This is just for reference - DO NOT commit real secrets here
      },

      // ── Auto-restart on crash ───────────────────────────────────────────────
      watch: false,
      max_memory_restart: '800M',  // restart if a worker exceeds 800MB RAM
      restart_delay: 2000,
      kill_timeout: 5000,          // give workers 5s to finish in-flight requests

      // ── Logs ───────────────────────────────────────────────────────────────
      error_file: './logs/pm2-error.log',
      out_file: './logs/pm2-out.log',
      merge_logs: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss',
    },
  ],
};
