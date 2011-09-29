function MongoGetter() {
  this.handles = {};
}

exports.MongoGetter = MongoGetter;

MongoGetter.prototype.get_mongo = function(options, cb) {
  var client;

  if ((!this.handles[options.host]) || (typeof this.handles[options.host] != "object")) {
    this.handles[options.host] = {};
  }

  if ((!this.handles[options.host][options.database]) || (typeof this.handles[options.host][options.database] != "object")) {
    var client = new (require("mongodb").Db)(options.database, new (require("mongodb").Server)(options.host, options.port, {}));

    var self = this;
    client.open(function(err, handle) {
      self.handles[options.host][options.database] = handle;
      self.get_mongo(options, cb);
    });

    return;
  }

  this.handles[options.host][options.database].collection(options.collection, cb);
}
