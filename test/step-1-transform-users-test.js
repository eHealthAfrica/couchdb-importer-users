var assert = require('assert');

var log = {
  debug: function() {},
  info : function() {},
  warn : function() {},
  error: function() {}
};

var state = {
  log: log
};

var transform = require('../lib/transform-users.js');

describe('1. transform users', function() {

  it('first example has one user', function() {

    var input = [
      {
        "name"    : "user_name_1",
        "password": "secret",
        "roles"   : ["my_role"],
        "details" : {
          "something": "whatever"
        }
      }
    ];
    var expectedOutput = [
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

    transform(state, input,
      function (err, output) {
        var outputStr = JSON.stringify(output[0]);
        assert.equal(output.length, 1, outputStr);
        assert.deepEqual(output[0], expectedOutput[0], outputStr);
      });
  });

  it('second example has no valid users', function() {

    var input = [
      {
        "name"    : "_not_valid",
        "password": "secret"
      },
      {
        "name"    : "valid_name_not_valid_password",
        "password": ""
      }
    ];

    transform(state, input,
      function (err, output) {
        assert.equal(output.length, 0);
      });
  });

});
