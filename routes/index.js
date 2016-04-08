var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')['development']);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});
router.get('/books/:id', function(req, res, next) {
  knex('books').where({'books.id': req.params.id})
  .then(function(book) {
    knex('bibliographies').where({'bibliographies.book_id': book[0].id})
    .pluck('author_id')
    .then(function(authorIds) {
      knex('authors').whereIn('id', authorIds)
      .then(function(authors) {
        res.render('book', {
          book: book[0],
          authors: authors
        })
      })
    })
  })
});

router.get('/books', function(req, res, next) {
  knex('books').innerJoin('bibliographies', 'books.id', 'bibliographies.book_id')
  .innerJoin('authors', 'bibliographies.author_id', 'authors.id')
  .orderBy('books.id')
  .then(function(results) {
    var prevElement = null;
    var concatenatedResults = [];
    results.forEach(function(element) {
      if ((prevElement === null) || (prevElement.book_id !== element.book_id)) {
        element.authors = element.first_name + " " + element.last_name;
        concatenatedResults.push(element);
        prevElement = element;
      }
      else {
        prevElement.authors += ", " + element.first_name + " " + element.last_name;
      }
    })
    res.render('books', {books: concatenatedResults});
  });
});

router.get('/authors', function(req, res, next) {
  knex('authors').innerJoin('bibliographies', 'authors.id', 'bibliographies.author_id')
  .innerJoin('books', 'bibliographies.book_id', 'books.id')
  .orderBy('authors.id')
  .then(function(results) {
    var prevElement = null;
    var concatenatedResults = [];
    results.forEach(function(element) {
      if ((prevElement === null) || (prevElement.author_id !== element.author_id)) {
        element.books = element.title;
        concatenatedResults.push(element);
        prevElement = element;
      }
      else {
        prevElement.books += ", " + element.title;
      }
    })
    res.render('authors', {authors: concatenatedResults});
  });
});

router.get('/authors/:id', function(req, res, next) {
  knex('authors').where({'authors.id': req.params.id})
  .then(function(author) {
    knex('bibliographies').where({'bibliographies.author_id': author[0].id})
    .pluck('book_id')
    .then(function(bookIds) {
      knex('books').whereIn('id', bookIds)
      .then(function(books) {
        res.render('author', {
          author: author[0],
          books: books
        })
      })
    })
  })
});

module.exports = router;
