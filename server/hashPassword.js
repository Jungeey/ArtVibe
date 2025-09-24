const bcrypt = require('bcryptjs');

const plainPassword = 'helloadmin'; // the password you want
bcrypt.hash(plainPassword, 12, (err, hash) => {
  if (err) throw err;
  console.log('Hashed password:', hash);
});
