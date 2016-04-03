## Tests

### Setup

1. To set up your tests, install the following local dependencies:

  ```sh
  $ npm install chai chai-http mocha passport-stub sqlite3 --save-dev
  ```

1. Also, be sure to install Mocha globally (if you have not already done so):

  ```sh
  $ npm install mocha -g
  ```

1. Add a `test` config to your *knexfile.js*, making sure to update the values based on your project structure:

  ```javascript
    test: {
      client: 'sqlite3',
      connection: {
        filename: './test.db'
      },
      migrations: {
        directory: __dirname + '/src/server/db/migrations'
      },
      seeds: {
        directory: __dirname + '/src/server/db/seeds/test'
      }
    },
  ```

1. **You will need to update the paths in each test file, based on your project structure.**

  My structures looks like this:

    ```sh
  ├── knexfile.js
  ├── package.json
  ├── src
  │   ├── client
  │   │   ├── css
  │   │   │   └── main.css
  │   │   └── js
  │   │       ├── authors.js
  │   │       ├── books.js
  │   │       └── helpers.js
  │   └── server
  │       ├── app.js
  │       ├── auth
  │       │   ├── helpers.js
  │       │   └── index.js
  │       ├── bin
  │       │   └── www
  │       ├── db
  │       │   ├── helpers.js
  │       │   ├── knex.js
  │       │   ├── migrations
  │       │   ├── queries.js
  │       │   └── seeds
  │       │       ├── dev
  │       │       │   ├── 01-books.js
  │       │       │   └── 02-authors.js
  │       │       └── test
  │       │           ├── 01-books.js
  │       │           └── 02-authors.js
  │       ├── routes
  │       │   ├── auth.js
  │       │   ├── authors.js
  │       │   ├── books.js
  │       │   ├── helpers.js
  │       │   └── index.js
  │       └── views
  │           ├── _layout.html
  │           ├── auth
  │           │   ├── login.html
  │           │   └── register.html
  │           ├── authors
  │           │   ├── add-author.html
  │           │   ├── all-authors.html
  │           │   ├── edit-author.html
  │           │   └── single-author.html
  │           ├── books
  │           │   ├── add-book.html
  │           │   ├── all-books.html
  │           │   ├── edit-book.html
  │           │   └── single-book.html
  │           ├── error.html
  │           ├── index.html
  │           ├── partials
  │           │   ├── authors-header.html
  │           │   ├── books-header.html
  │           │   ├── flash.html
  │           │   ├── nav.html
  │           │   └── search-header.html
  │           └── results.html
  └── test
      ├── integration
      │   ├── authors.js
      │   ├── books.js
      │   ├── helpers.js
      │   └── index.js
      └── mocha.opts
  ```

### Run

To run your tests, simply run `mocha` from your project's root directory.