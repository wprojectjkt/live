<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>WProject - Masuk</title>
  <link rel="stylesheet" href="style.css">
</head>
<body oncontextmenu="return false">
  <div class="container">
    <h1>🔐 Masuk dengan Token</h1>
    <div class="input-group">
      <input type="text" id="tokenInput" placeholder="Masukkan token Anda">
      <button id="pasteBtn">Tempel</button>
      <button onclick="validateToken()">Masuk</button>
    </div>
    <p id="status"></p>
  </div>
  <script src="app.js"></script>
</body>
</html>
