function(doc) {
if(doc._id && doc._id.match(/org.couchdb.user:.*/)) {
  emit(doc._id, doc)
  }
}