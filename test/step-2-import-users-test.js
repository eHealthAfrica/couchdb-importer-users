var assert = require('assert');
var nock = require('nock');

var log = {
  debug: function() {},
  info : function() {},
  warn : function() {},
  error: function() {}
};


var TARGET_DB_URL  = 'http://localhost:5984';
var TARGET_DB_NAME = '_users';

var state = {
  log    : log,
  dbUrl  : TARGET_DB_URL,
  replace: false
};

var importer = require('../lib/import-users.js');


var input = [
  {
    "_id"     : "org.couchdb.user:user_name_1",
    "name"    : "user_name_1",
    "type"    : "user",
    "password": "secret",
    "roles"   : ["my_role"],
    "details" : {
      "something": "whatever"
    }
  }
];

// moch server request
nock(TARGET_DB_URL)
  // check if DB exists
  .get('/' + TARGET_DB_NAME)
  .reply(200, 'ok')

  // get all users
  .get('/' + TARGET_DB_NAME + '/_all_docs?include_docs=true')
  .reply(200, { rows: [] })

  // post new users
  .post('/' + TARGET_DB_NAME + '/_bulk_docs', { docs: input })
  .reply(201, [ { "id" : "org.couchdb.user:user_name_1" } ]);



describe('2. import users', function() {

  it('first example import one user', function() {
    importer(state, input,
      function (err, output) {
        var outputStr = JSON.stringify(output[0]);
        assert.equal(output.length, 1, outputStr);
        assert.deepEqual(output[0], input[0], outputStr);
      });
  });

});
