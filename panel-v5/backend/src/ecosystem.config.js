module.exports = {
  apps: [
    {
      name: "ks-panel",
      script: "./index.js",
      cwd: "./",
      env: {
        NODE_ENV: "production",
      },
      env_development: {
        NODE_ENV: "development",
      },
      restart_delay: 5000,
      max_restarts: 10,
    },
  ],
};
