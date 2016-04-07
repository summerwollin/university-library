module.exports = {
  debug: true,

  development: {
    client: 'postgresql',
    connection: 'postgres://localhost/galvanize-reads2'
  },
  pool: {
    min: 2,
    max: 10
  },
  seeds: {
  directory: './seeds/'
}
};
