'use strict';

var _ = require('lodash');

module.exports = function (state, list, callback) {
  var log = state.log;

  if (!list || list.length === 0) {
    log.warn('No users to transform. End process.');
    callback( { message: 'Empty list'} ); // nothing to do
    return;
  }

  var NAME_PATTERN = /^[a-zA-Z]+[a-zA-Z0-9_\-\.]*$/;

  //
  // transforms the list of users in CouchDB users
  // and remove the not valid
  //
  var users = [];

  list.forEach(function (user) {

    // first check username and password
    if (user.name === undefined) {
      // not valid, ignore
      return;
    }
    user.name = user.name.trim(); // trim trailing spaces

    if (user.name.match(NAME_PATTERN) === null) {
      // not valid, ignore
      log.error('User "%s" has not valid username', user.name);
      return;
    }

    if (user.password === undefined || user.password.trim() === '') {
      log.error('User "%s" has not valid password', user.name);
      // not valid, ignore
      return;
    }

    // add user to list
    //
    // {
    //   "_id"        : "org.couchdb.user:name",
    //   "name"       : "name",
    //   "type"       : "user",
    //   "password"   : "pass",
    //   "roles"      : [ list_of_roles ],
    //   "details"    : { personal_data },
    //   "_databases" : { "member", "admins" }
    // }
    //
    var userDB = {
      _id      : 'org.couchdb.user:' + user.name,
      name     : user.name,
      type     : 'user',
      password : user.password,
      roles    : []
    };

    if (user.roles) {
      // check rolenames, couchdb does not allow roles starting with `_`
      user.roles.forEach(function (role) {
        if (role.charAt(0) !== '_') {
          userDB.roles.push(role);
        }
      });
    }

    if (user.details) {
      userDB.details = user.details;
    }

    if (user._databases) {
      if (user._databases.members || user._databases.admins) {
        userDB._databases = {
          members : user._databases.members || [],
          admins  : user._databases.admins  || []
        };
      }
    }

    users.push(userDB);

  });

  log.info('%d users found. Proceding to import...', users.length);
  callback(null, users);
};
