process.env.NODE_ENV = 'test';

var chai = require('chai');
var chaiHttp = require('chai-http');

var knex = require('../../src/server/db/knex');
var queries = require('../../src/server/db/queries');
var databaseHelpers = require('../../src/server/db/helpers');
var server = require('../../src/server/app');

var should = chai.should();

chai.use(chaiHttp);

describe('main routes:', function() {
  beforeEach(function(done) {
    knex.migrate.latest()
    .then(function() {
      return knex.seed.run()
        .then(function() {
          done();
        });
    });
  });
  afterEach(function(done) {
    knex.migrate.rollback()
      .then(function() {
        done();
      });
  });
  describe('GET /', function() {
    it('should render correctly', function(done) {
      chai.request(server)
      .get('/')
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads</h1>');
        done();
      });
    });
  });
  describe('POST /search', function() {
    it('should display results', function(done) {
      chai.request(server)
      .post('/search')
      .send({term: 'python'})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads<small>&nbsp;Search Results</small></h1>');
        done();
      });
    });
    it('should display no results', function(done) {
      chai.request(server)
      .post('/search')
      .send({term: 'xyz'})
      .end(function(err, res) {
        res.should.have.status(200);
        res.should.be.html;  // jshint ignore:line
        res.text.should.have.string(
          '<h1 class="page-header">Galvanize Reads</h1>');
        done();
      });
    });
  });
});