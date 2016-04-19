# # eHealth CouchDB Users Importer

- [Export users from CouchDB](#exporting)
- [Import users into CouchDB](#importing)

## Setup

git clone git@github.com:eHealthAfrica/couchdb-users-bulk-import.git
cd couchdb-users


### Exporting

#### json exporting

TODO

#### csv exporting

The csv exporting functionality is provided by a `list` function
running against a view function. In order to operate on the remote
host conveniently, we suggest you to set some environment variables:

```
$  admin_password=verysecret # prefixing with a space will skip it in history
$ host="https://admin:$admin_password@dev-gn-call-center.eocng.org/_couchdb/" # for example
```

After setting these, you can use the following commands
verbatim. Exporting can be done by pushing the view if it is not on
the database already, and then getting the results.

- push the couchdb exporter design documents to the `_users` database.
In order to make this step easier, using [couchapp](https://github.com/eHealthAfrica/tools-reference/blob/master/couchapp.md) is recommended.

```
cd csv_exporter
couchapp push "$host/_users"
```

- get the results. It is necessary to request `include_docs=true` as well as to pass as parameters the fields we want.
see [fields parameter documentation in the code](./csv_exporter/lists/csv.js#3-8L)

```
curl "$host/_users/_design/csv/_list/csv/users/?include_docs=true&fields=_id~ID|details.fullName~Name|roles~Role(s)|details.fullName~Details.fullName|details.info~Details.info"
```

[](http://www.url.com)

### Importing
```
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
