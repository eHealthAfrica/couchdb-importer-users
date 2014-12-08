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

var transform = require('../lib/transform-databases.js');

describe('3. transform databases', function() {

  it('third example has one member and one admin', function() {

    var input = [
      {
        "name"      : "user_1",
        "password"  : "secret",
        "_databases": { "members": ["db_1"] }
      },
      {
        "name"      : "user_2",
        "password"  : "secret",
        "_databases": { "admins": ["db_1"] }
      }
    ];

    var expectedOutput = [
      {
        "name"    : "db_1",
        "members" : [ "user_1" ],
        "admins"  : [ "user_2" ]
      }
    ];

    transform(state, input,
      function (err, output) {
        var _securityStr = JSON.stringify(output[0]);

        assert.equal(output.length, 1, _securityStr);
        assert.deepEqual(output[0], expectedOutput[0], _securityStr);
      });
  });

});
