# # eHealth CouchDB Users Importer

> Import users into CouchDB

## Setup

```
git clone git@github.com:eHealthAfrica/couchdb-users-bulk-import.git
cd couchdb-users
npm install
```


## Usage

```
node bin/import \
  --source /path/to/users.json \
  --target http://localhost:5984 --replace
```

OR export ENV vars before running `node bin/import`

```
COUCHDB_USERS_SOURCE=/file/to/users.json
COUCHDB_USERS_TARGET=http://localhost:5984
COUCHDB_USERS_REPLACE=false
```


## Options

### `--source` **(required)**

Pass path of the json file with the users list

### `--target` **(required)**

Pass Url of the target CouchDB, including username & password in
the form of `http://localhost:5984`

### `--replace` **(optional)**

By default, the import ignore updates. To force an update,
use the flag `--replace`.


## Users list

The expected file format is:
```json
[
  {
    "name"     : "username",
    "password" : "secret",
    "roles"    : [ "list_of_user_roles" ],
    "details"  : { "optional_data" },
    "_databases" : {
      "members"  : [ "list_of_databases_names_in_which_the_user_is_member" ],
      "admins"   : [ "list_of_databases_names_in_which_the_user_is_admin" ]
    }
  }
]
```

### `name` **(required)**

The username, it should not be already included in couchdb server, and cannot
start with `_`.

### `password` **(required)**

There is no password strength checking.

### `roles` **(optional)**

The list of roles that the user will have. As usual, the roles cannot
start with `_`.

### `details` **(optional)**

An object containing optional data that is needed to be saved
with user object.

### `_databases.members` **(optional)**

The list of existing databases names in which the user should access
as a normal member.

### `_databases.admins` **(optional)**

The list of existing databases names in which the user should access
as an admin.

## Author

© 2014 [eHealth Systems Africa](http://ehealthafrica.org)
