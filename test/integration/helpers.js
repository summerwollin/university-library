var passportStub = require('passport-stub');

var queries = require('../../src/server/db/queries');


function autenticateUser(done) {
  queries.addUser({
    email: 'brad@ly.com',
    password: '1234',
    admin: false
  })
  .then(function(userID) {
    queries.getSingleUser(userID[0])
      .then(function(user) {
        passportStub.login(user[0]);
        done();
      });
  });
}

function autenticateAdmin(done) {
  queries.addUser({
    email: 'her@man.com',
    password: '1234',
    admin: true
  })
  .then(function(userID) {
    queries.getSingleUser(userID[0])
      .then(function(user) {
        passportStub.login(user[0]);
        done();
      });
  });
}


module.exports = {
  autenticateUser: autenticateUser,
  autenticateAdmin: autenticateAdmin
};