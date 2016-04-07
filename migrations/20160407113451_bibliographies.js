
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bibliographies', function(table) {
    table.increments();
    table.increments('book_id').unsigned().references('id').inTable('books');
    table.increments('author_id').unsigned().references('id').inTable('authors');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('bibliographies');
};
