
exports.seed = function(knex, Promise) {
  return Promise.join(
    // Deletes ALL existing entries
    knex('bibliographies').del(),

    // Inserts seed entries
    knex('bibliographies').insert({book_id: 1, author_id: 1}),
    knex('bibliographies').insert({book_id: 1, author_id: 2}),
    knex('bibliographies').insert({book_id: 1, author_id: 3}),
    knex('bibliographies').insert({book_id: 2, author_id: 4}),
    knex('bibliographies').insert({book_id: 3, author_id: 5}),
    knex('bibliographies').insert({book_id: 4, author_id: 6}),
    knex('bibliographies').insert({book_id: 5, author_id: 6}),
    knex('bibliographies').insert({book_id: 6, author_id: 6})

  );
};
