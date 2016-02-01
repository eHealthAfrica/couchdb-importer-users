function(head, req) {

  // The fields to be exported should be passed as url query parameter `fields`
  // The header names will be generated from the field name, but can be aliased
  // to a different value by append ~[header name] to the field path e.g.:
  // `patient.name~name` would name the header `name`
  // `patient.name~name|contact.phoneNo~phone`

  var fieldConfigs = req.query.fields.split('|');
  var fields = [];
  var headers = [];
  fieldConfigs.forEach(function(c) {
    var f = c.split('~');
    fields.push(f[0]);
    headers.push(f.length > 1 ? f[1] : f[0]);
  });

  var joinChars = ';';

  // get a value the value of an objects property, e.g: 'foo.bar.baz'
  function getValue(obj, path) {
    path = typeof path === 'string' ? path.split('.') : path;

    if (path.length === 0) {
      return '';
    }
    if (!obj || typeof obj !== 'object') {
      return '';
    }
    var prop = path.shift();
    if (!obj.hasOwnProperty(prop)) {
      return '';
    }
    var value = obj[prop];
    if (path.length === 0) {
      return value;
    }
    return getValue(value, path);
  }

  // filename
  var now = new Date().toISOString().substring(0, 19).replace(/(:|[T])/g,'-');
  var name = 'export-';
  if (req && req.path) {
    // take name from path (view name is the last member)
    name = req.path[ req.path.length - 1 ];
  }
  var filename = name + '-' + now + '.csv';

  start({
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Content-Disposition': 'attachment; filename="' + filename + '"'
    }
  });

  // send csv header line and first row values
  send(headers.join(joinChars) + '\n');

  var row;
  var hasData = false;
  while(row = getRow()) {
    hasData = true;
    var values = fields.map(function(path) {
      return '"' + getValue(row.doc, path) + '"';
    });
    send(values.join(joinChars) + '\n');
  }
  if (!hasData) {
    send('There are no results in the view with current query parameters.\n');
  }
  send('\n');
}