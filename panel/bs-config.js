module.exports = {
  proxy: "http://localhost:8080",
  files: ["views/**/*.ejs"],
  port: 2000,
  ui: {
    port: 3005,
  },
  open: false,
  notify: false,
};
