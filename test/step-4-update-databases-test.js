var assert = require('assert');
var nock = require('nock');

var log = {
  debug: function() {},
  info : function() {},
  warn : function() {},
  error: function() {}
};

var TARGET_DB_URL  = 'http://localhost:5984';
var TARGET_DB_NAME = 'db_1';

var state = {
  log  : log,
  dbUrl: TARGET_DB_URL
};

var update = require('../lib/update-databases.js');


var input = [
  {
    "name"    : TARGET_DB_NAME,
    "members" : [ "user_1" ],
    "admins"  : [ "user_2" ]
  }
];

var _security = {
  "members": {
    "names": [ "user_1" ],
    "roles": []
  },
  "admins": {
    "names": [ "user_2" ],
    "roles": []
  }
}

// moch server request
nock(TARGET_DB_URL)
  // check if DB exists
  .get('/' + TARGET_DB_NAME)
  .reply(200, 'ok')

  // get database _security
  .get('/' + TARGET_DB_NAME + '/_security')
  .reply(200, {})

  // update _security
  .put('/' + TARGET_DB_NAME + '/_security', _security)
  .reply(201, {});


describe('4. update databases security', function() {

  it('third example update one database', function() {
    update(state, input,
      function (err, output) {
        assert.equal(err, null);
      });
  });

});
