const express = require("express");
const path = require("path");
const app = express();

const rootDir = path.join(__dirname, "..");

app.use(express.static(rootDir));

app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен. Открой http://localhost:${PORT}`);
});
