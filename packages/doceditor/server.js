const logger = require("morgan");
const { createServer } = require("http");
const { parse } = require("url");
const next = require("next");
const winston = require("./lib/logger");
const config = require("./config/index.js");

const dev = process.env.NODE_ENV === "development";

const port = config.get("PORT") ?? 5013;
const hostname = config.get("HOSTNAME") ?? "localhost";

// when using middleware `hostname` and `port` must be provided below
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

winston.stream = {
  write: (message) => winston.info(message),
};

// app.use(
//   logger("dev", {
//     stream: winston.stream,
//     skip: function (req, res) {
//       if (req.url == "/health") {
//         return true;
//       } else {
//         return false;
//       }
//     },
//   }),
// );

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      // Be sure to pass `true` as the second argument to `url.parse`.
      // This tells it to parse the query portion of the URL.
      const parsedUrl = parse(req.url, true);

      // app.get("/health", (req, res) => {
      //   res.send({ status: "Healthy" });
      // });

      await handle(req, res, parsedUrl);
    } catch (err) {
      winston.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  })
    .once("error", (err) => {
      winston.error(err);
      process.exit(1);
    })
    .listen(port, () => {
      winston.info(`Server is listening on port ${port}`);
    });
});
