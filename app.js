process.env.NODE_ENV = "production";

const path = require("path");
const http = require("http");
const { parse } = require("url");
const next = require("next");

try {
  require("dotenv").config({ path: path.join(__dirname, ".env"), override: true });
} catch (error) {
  console.error("dotenv load failed:", error.message);
}

const app = next({ dev: false });
const handle = app.getRequestHandler();

app.prepare()
  .then(() => {
    http.createServer((req, res) => {
      handle(req, res, parse(req.url, true));
    }).listen(process.env.PORT);
  })
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });