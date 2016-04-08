
exports.up = function(knex, Promise) {
  return knex.schema.createTable('bibliographies', function(table) {
    table.integer('book_id').references('books.id').onDelete('cascade').onUpdate('cascade');
    table.integer('author_id').references('authors.id').onDelete('cascade').onUpdate('cascade');
  })
};

exports.down = function(knex, Promise) {
  return knex.schema.dropTable('bibliographies');
};
