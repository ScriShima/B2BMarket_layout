const express = require("express");
const path = require("path");
const app = express();

// Определяем путь к корневой папке (на один уровень выше папки js)
const rootDir = path.join(__dirname, "..");

// Указываем, что все статические файлы лежат в корневой папке
app.use(express.static(rootDir));

// При заходе на главную страницу отдаем index.html из корня
app.get("/", (req, res) => {
  res.sendFile(path.join(rootDir, "index.html"));
});

// Задаем порт
const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Сервер запущен. Открой http://localhost:${PORT}`);
});
