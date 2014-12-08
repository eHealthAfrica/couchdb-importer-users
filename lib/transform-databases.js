'use strict';

var _ = require('lodash');

module.exports = function (state, list, callback) {
  var log = state.log;

  if (!list || list.length === 0) {
    log.warn('No databases to transform. End process.');
    callback( { message: 'Empty list'} ); // nothing to do
    return;
  }

  //
  // transforms the list of users in CouchDB databases _security
  //
  var databases = {};

  list.forEach(function (user) {

    if (!user._databases) {
      return;
    }

    // add user to database as member or admin

    // as member
    var members = user._databases.members;
    if (members) {
      members.forEach(function (dbName) {
        databases[dbName] = databases[dbName] || bearSecurity(dbName);
        databases[dbName].members.push(user.name);
      });
    }

    // as admin
    var admins = user._databases.admins;
    if (admins) {
      admins.forEach(function (dbName) {
        databases[dbName] = databases[dbName] || bearSecurity(dbName);
        databases[dbName].admins.push(user.name);
      });
    }
  });

  databases = _.values(databases) || [];

  log.info('%d databases to change. Proceding to update...',
      databases.length);
  callback(null, databases);
};

//
// create empty database `_security`
//
function bearSecurity(name) {
  return { name: name, members: [], admins: [] };
}
