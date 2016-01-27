function(doc) {
if(doc.details && doc.details.fullName) {
  emit(doc._id, doc)
  }
}