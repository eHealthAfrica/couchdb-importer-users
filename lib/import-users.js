'use strict';

var _    = require('lodash');
var nano = require('nano');

module.exports = function (state, list, callback) {
  var log = state.log;

  if (!list || list.length === 0) {
    log.warn('No users to import. End process.');
    callback( { message: 'Empty list'} ); // nothing to do
    return;
  }

  var targetDb = nano(state.dbUrl).use('_users');

  // 1. fetch current users
  targetDb.list({ include_docs: true }, function (errL, body) {
    if (errL) {
      log.error(errL);
      callback(errL);
      return;
    }

    var currentUsers = body.rows.filter(function (row) {
      return row.id.indexOf('org.couchdb.user:') === 0;
    });

    // 2. check current users with list
    var users = [];

    list.forEach(function (user) {
      var index = _.findIndex(currentUsers, { 'id': user._id });
      if (index === -1) {
        // new user (remove _databases)
        users.push(_.omit(user, '_databases'));

      } else if (state.replace === true) {
        // existing and replace
        var current = currentUsers[index].doc;
        current.password = user.password; // replace password
        current.roles    = user.roles;    // replace roles
        current.details  = user.details;  // replace details

        log.warn('"%s" is going to be replaced', user.name);
        users.push(current); // update user

      } else {
        log.error('"%s" already exists', user.name);
      }
    });

    // 3. import users
    targetDb.bulk({ docs: users }, function (errB, feedbacks) {
      if (errB) {
        log.error(errB);
        callback(errB);
        return;
      }

      var importedUsers = [];

      feedbacks.forEach(function (feedback) {
        if (feedback.error) {
          log.error('Error on importing user "%s", reason: %s',
              feedback.id, feedback.reason);
        } else {
          log.info('User "%s" imported', feedback.id);

          var index = _.findIndex(list, { '_id': feedback.id });
          var user = list[index];
          importedUsers.push(user);
        }
      });

      log.info('%d users imported. Proceding to databases step...',
          importedUsers.length);
      callback(null, importedUsers);
    });

  });

};
