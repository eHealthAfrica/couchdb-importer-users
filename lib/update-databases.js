'use strict';

var _     = require('lodash');
var async = require('async');
var nano  = require('nano');

module.exports = function (state, list, callback) {
  var log = state.log;

  if (!list || list.length === 0) {
    log.warn('No databases to update. End process.');
    callback( { message: 'Empty list'} ); // nothing to do
    return;
  }

  async.each(list,
    function(dbSecurity, callbackEach) {
      updateSecurity(state, dbSecurity, callbackEach);
    },
    callback
  );

};


//
// update databases `_security` with new members and admins
//
function updateSecurity(state, dbSecurity, callback) {
  var log = state.log;
  var dbName = dbSecurity.name;
  var db = nano(state.dbUrl).use(dbName);

  // fetch database security
  db.get('_security', function(errG, _security) {
    if (errG) {
      if (errG.message === 'no_db_file') {
        log.error('Database "%s" does not exist.', dbName);
      } else {
        log.error('Error on database "%s", reason: %s',
            dbName, errG.reason);
      }
      callback(errG);
      return;
    }

    var updated = false; // control possible changes, avoid useless updates

    var properties = [ 'members', 'admins' ];
    properties.forEach(function (property) {
      // add new values
      updated = addSecurity(dbSecurity, _security, property) || updated;
    });

    // something changed, update database security
    if (updated) {
      db.insert(_security, '_security', function(errI, feedback) {
        if (errI) {
          log.error('Error on database "%s", reason: %s',
              dbName, errI.reason);
          callback(errI);
        } else {
          log.info('Database _security on "%s" updated', dbName);
          callback(null, dbName);
        }
      }); // update database _security
    }
  }); // get database _security
}

//
// Adds name to security property: members or admins
//
function addSecurity(dbSecurity, _security, property) {
  // property structure
  _security[property] = _security[property] || {};
  _security[property].names = _security[property].names || [];
  _security[property].roles = _security[property].roles || [];

  var updated = false; // control possible changes, avoid useless updates

  // search names
  dbSecurity[property].forEach(function (name) {
    if (_security[property].names.indexOf(name) === -1) {
      _security[property].names.push(name); // add new
      updated = true; // something change
    }
  });

  return updated;
}
