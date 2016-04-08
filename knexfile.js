module.exports = {
  debug: true,

  development: {
    client: 'postgresql',
    connection: 'postgres://localhost/galvanize_reads'
  },
  pool: {
    min: 2,
    max: 10
  },
  seeds: {
  directory: './seeds/'
}
};
