var express = require('express');
var router = express.Router();
var knex = require('knex')(require('../knexfile')[process.env.DB_ENV]);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index');
});


router.get('/books', function(req, res, next) {
  knex('books').innerJoin('bibliographies', 'books.id', 'bibliographies.book_id')
  .innerJoin('authors', 'bibliographies.author_id', 'authors.id')
  .orderBy('books.id')
  .then(function(results) {
    knex('books').count('id')
    .then(function(numBooks) {
      var prevElement = null;
      var concatenatedResults = [];
      results.forEach(function(element) {
        if ((prevElement === null) || (prevElement.book_id !== element.book_id)) {
          element.authors = element.first_name + " " + element.last_name;
          concatenatedResults.push(element);
          prevElement = element;
        } else {
          prevElement.authors += ", " + element.first_name + " " + element.last_name;
        }
      })
      res.render('books', {books: concatenatedResults, numBooks: numBooks[0].count});
    })
  });
});

router.get('/books/add', function(req, res, next) {
  knex('authors')
  .then(function(authors) {
      res.render('createBooks', {authors: authors});
  })
});


router.post('/books/add', function(req, res, next) {

  function flatten(arr) {
    const flat = [].concat(...arr)
    return flat.some(Array.isArray) ? flatten(flat) : flat;
  }

  knex('books').insert({title: req.body.title, genre: req.body.genre, description: req.body.desc, cover_url: req.body.image})
  .returning('id')
  .then(function(id) {
    var authors = req.body.authors;
    var bibliographies = flatten([authors]).map(function(author){
      return {book_id: id[0], author_id: author};
    });

    knex('bibliographies').insert(bibliographies).then(function(){
      res.redirect('/books');
    });
  });
});

router.post('/books/filter', function(req, res, next){
  var filterObj = {};

  if (req.body.genre !== '') {
    filterObj.genre = req.body.genre;
  }

  if (req.body.title !== '') {
    filterObj.title = req.body.title;
  }

  knex('books').where(filterObj).then(function(filtered) {
    res.render('filterBooks', {books: filtered});
  })
});

router.get('/books/:id', function(req, res, next) {
  console.log(req.params.id);
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

router.delete('/books/:id', function(req, res, next) {
  knex('books').where({'id': req.params.id}).del().then(function() {
    res.status(200).json({book: 'deleted'});
  });
});

router.get('/books/:id/edit', function(req, res, next) {
  knex('books').where({'books.id': req.params.id})
  .then(function(book) {
    knex('authors')
      .then(function(authors) {
        res.render('editBook', {
          book: book[0],
          authors: authors
        })
      })
    })
});

router.post('/books/:id/edit', function(req, res, next) {

  function flatten(arr) {
    const flat = [].concat(...arr)
    return flat.some(Array.isArray) ? flatten(flat) : flat;
  }

  knex('books').where({'id': parseInt(req.params.id)}).update({title: req.body.title, genre: req.body.genre, description: req.body.desc, cover_url: req.body.image})
    .then(function() {
      var authors = req.body.authors;
      var bibliographies = flatten([authors]).map(function(author){
        return {book_id: parseInt(req.params.id), author_id: author};
      });
    knex('bibliographies').insert(bibliographies).then(function(){
      res.redirect('/books');
    });
  });
});

router.get('/authors', function(req, res, next) {
  knex('authors').innerJoin('bibliographies', 'authors.id', 'bibliographies.author_id')
  .innerJoin('books', 'bibliographies.book_id', 'books.id')
  .orderBy('authors.id')
  .then(function(results) {
    knex('authors').count('id')
    .then(function(numAuthors) {
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
      res.render('authors', {authors: concatenatedResults, numAuthors: numAuthors[0].count});
    });
  });
});

router.get('/authors/add', function(req, res, next) {
  knex('books')
  .then(function(books) {
      res.render('createAuthor', {books: books});
  })
});

router.post('/authors/add', function(req, res, next) {

  function flatten(arr) {
    const flat = [].concat(...arr)
    return flat.some(Array.isArray) ? flatten(flat) : flat;
  }

  knex('authors').insert({first_name: req.body.first, last_name: req.body.last, biography: req.body.bio, portrait_url: req.body.image})
  .returning('id')
  .then(function(id) {
    var books = req.body.books;
    var bibliographies = flatten([books]).map(function(book){
      return {author_id: id[0], book_id: book};
    });

    knex('bibliographies').insert(bibliographies).then(function(){
      res.redirect('/authors');
    });
  });
});

router.post('/authors/filter', function(req, res, next){
  var filterObj = {};

  if (req.body.first !== '') {
    filterObj.first_name = req.body.first;
  }

  if (req.body.last !== '') {
    filterObj.last_name = req.body.last;
  }

  knex('authors').where(filterObj).then(function(filtered) {
    res.render('filterAuthors', {authors: filtered});
  })
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

router.delete('/authors/:id', function(req, res, next) {
  knex('bibliographies').where({'bibliographies.author_id': req.params.id}).del()
  .then(function() {
    knex('authors').where({'authors.id': req.params.id}).del()
  })
  .then(function() {
    res.status(200).json({book: 'deleted'});
  });
});

router.get('/authors/:id/edit', function(req, res, next) {
  knex('authors').where({'authors.id': req.params.id})
  .then(function(author) {
    knex('books')
      .then(function(books) {
        console.log(books);
        res.render('editAuthor', {
          author: author[0],
          books: books
        })
      })
    })
})

router.post('/authors/:id/edit', function(req, res, next) {

  function flatten(arr) {
    const flat = [].concat(...arr)
    return flat.some(Array.isArray) ? flatten(flat) : flat;
  }

  knex('authors').where({'id': parseInt(req.params.id)}).update({first_name: req.body.first, last_name: req.body.last, biography: req.body.bio, portrait_url: req.body.image})
    .then(function() {
      var books = req.body.books;
      var bibliographies = flatten([books]).map(function(book){
        return {author_id: parseInt(req.params.id), book_id: book};
      });
    knex('bibliographies').insert(bibliographies).then(function(){
      res.redirect('/authors');
    });
  });
});

module.exports = router;
