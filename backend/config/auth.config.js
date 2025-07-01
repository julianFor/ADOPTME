module.exports = {
  secret: process.env.JWT_SECRET || 'adoptme_secret_key',
  jwtExpiration: '24h' // puedes ajustar el tiempo a lo que desees
};
