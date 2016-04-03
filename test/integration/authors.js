process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');
var passportStub = require('passport-stub');

var knex = require('../../src/server/db/knex');
var queries = require('../../src/server/db/queries');
var testHelpers = require('./helpers');
var databaseHelpers = require('../../src/server/db/helpers');
var server = require('../../src/server/app');

var should = chai.should();

passportStub.install(server);
chai.use(chaiHttp);

describe('author routes:', function() {

  var allAuthors;

  beforeEach(function(done) {
    knex.migrate.latest()
    .then(function() {
      return knex.seed.run()
        .then(function() {
          queries.getAuthors()
            .then(function(authors) {
              allAuthors = databaseHelpers.mapBooksToAuthors(authors);
              done();
            });
        });
    });
  });

  afterEach(function(done) {
    knex.migrate.rollback()
      .then(function() {
        done();
      });
  });

  describe('GET /authors', function() {
    it('should display the first page of authors', function(done) {
      chai.request(server)
      .get('/authors')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads<small>&nbsp;Authors</small></h1>'
        );
        res.text.should.have.string(
          '<li><a href="/authors?page=2">Next&nbsp;&raquo;</a></li>'
        );
        res.text.should.have.string(allAuthors[0].last_name);
        res.text.should.have.string(allAuthors[0].books[0].title);
        res.text.should.have.string(
          '<h2>Total Authors:&nbsp;<span><em>'+allAuthors.length+
          '</em></span></h2>');
        done();
      });
    });
    it('should display the second page of authors', function(done) {
      chai.request(server)
      .get('/authors?page=2')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads<small>&nbsp;Authors</small></h1>'
        );
        res.text.should.have.string(
          'li><a href="/authors?page=1">&laquo;&nbsp;Previous</a></li>'
        );
        res.text.should.have.string(allAuthors[10].last_name);
        res.text.should.have.string(allAuthors[10].books[0].title);
        res.text.should.have.string(
          '<h2>Total Authors:&nbsp;<span><em>'+allAuthors.length+
          '</em></span></h2>');
        done();
      });
    });
  });

  describe('GET /authors/:id', function() {
    it('should display a single author', function(done) {
      chai.request(server)
      .get('/authors/'+allAuthors[0].id)
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads<small>&nbsp;Authors</small></h1>'
        );
        res.text.should.have.string(allAuthors[0].last_name);
        res.text.should.have.string(allAuthors[0].books[0].title);
        done();
      });
    });
  });

  describe('POST /authors', function() {
    describe('if unauthenticated', function() {
      it('should not add an author', function(done) {
        chai.request(server)
        .post('/authors')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated', function() {
      beforeEach(function(done) {
        testHelpers.autenticateUser(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should not add an author', function(done) {
        chai.request(server)
        .post('/authors')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated as an admin', function() {
      beforeEach(function(done) {
        testHelpers.autenticateAdmin(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should add an author', function(done) {
        chai.request(server)
        .post('/authors')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads<small>&nbsp;Authors</small></h1>'
          );
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length+1);
              done();
            });
        });
      });
    });
  });

  describe('PUT /authors/:id/edit', function() {
    describe('if unauthenticated', function() {
      it('should not update a author', function(done) {
        chai.request(server)
        .post('/authors/1/edit')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              authors[0].first_name.should.equal('Alex');
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated', function() {
      beforeEach(function(done) {
        testHelpers.autenticateUser(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should not update a author', function(done) {
        chai.request(server)
        .post('/authors/1/edit')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              authors[0].first_name.should.equal('Alex');
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated as an admin', function() {
      beforeEach(function(done) {
        testHelpers.autenticateAdmin(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should update a authors', function(done) {
        chai.request(server)
        .post('/authors/1/edit')
        .send({
          first_name: 'Michael',
          last_name: 'Herman',
          biography: 'I am an author',
          portrait_url: 'https://me.martelli.jpg'
        })
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads<small>&nbsp;Authors</small></h1>'
          );
          queries.getAuthors()
            .then(function(authors) {
              authors[0].first_name.should.equal('Michael');
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
  });

  describe('DELETE /authors/:id', function() {
    describe('if unauthenticated', function() {
      it('should not delete an author', function(done) {
        chai.request(server)
        .delete('/authors/1')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated', function() {
      beforeEach(function(done) {
        testHelpers.autenticateUser(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should not delete a author', function(done) {
        chai.request(server)
        .delete('/authors/1')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.html;  // jshint ignore:line
          res.text.should.have.string(
            '<h1 class="page-header">Galvanize Reads</h1>');
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length);
              done();
            });
        });
      });
    });
    describe('if authenticated as an admin', function() {
      beforeEach(function(done) {
        testHelpers.autenticateAdmin(done);
      });
      afterEach(function(done) {
        passportStub.logout();
        done();
      });
      it('should delete a author', function(done) {
        chai.request(server)
        .delete('/authors/1')
        .end(function(err, res) {
          res.should.have.status(200);
          res.should.be.json;  // jshint ignore:line
          res.text.should.have.string('{"status":"success"}');
          queries.getAuthors()
            .then(function(authors) {
              databaseHelpers.mapBooksToAuthors(authors).length.should.equal(allAuthors.length-1);
              done();
            });
        });
      });
    });
  });

});