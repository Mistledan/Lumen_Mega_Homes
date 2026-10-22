process.env.NODE_ENV = "production";

const http = require("http");
const { parse } = require("url");
const next = require("next");

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