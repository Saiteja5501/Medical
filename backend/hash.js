const bcrypt = require("bcryptjs");

const enteredPassword = "Saiteja@5501";  // EXACTLY what you type

const hashFromDB = "$2b$10$qegYTLXA5vjZYzcJrKCixe2MlcC5iJX2igQrAUeRqGPEysZ3muMii";  // paste full hash

bcrypt.compare(enteredPassword, hashFromDB).then(result => {
  console.log("Match result:", result);
});
