console.log("vue.config.js");
const { defineConfig } = require("@vue/cli-service");
const path = require("path");
module.exports = defineConfig({
  // outputDir: path.resolve(__dirname, "../public/dc/"),
  //outputDir: "/var/www/html/dc",
  transpileDependencies: true,
  configureWebpack: {
    output: {
      libraryTarget: "system",
      filename: "js/[name].js",
      chunkFilename: "js/[name].js",
    },
  },
  devServer: {
    hot: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, PATCH, OPTIONS",
      "Access-Control-Allow-Headers":
        "X-Requested-With, content-type, Authorization",
    },
    client: {
      overlay: true,
      progress: true,
    },
    watchFiles: {
      paths: ["src/**/*.*"],
      options: {
        usePolling: true,
      },
    },
  },
  lintOnSave: false,
});
