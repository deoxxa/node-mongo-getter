function MongoGetter(mongodb) {
  this.mongodb = mongodb;
  this.servers = {};
}

exports.MongoGetter = MongoGetter;

MongoGetter.prototype.get_server = function(options, cb) {
  options = options || {};
  options.host = options.host || "localhost";
  options.port = options.port || 27017;

  var skey = options.host + ":" + options.port;

  this.servers[skey] = this.servers[skey] || {server: null, databases: {}};

  if (this.servers[skey].server === null) {
    this.servers[skey].server = new this.mongodb.Server(options.host, options.port, {});
  }

  cb(null, this.servers[skey].server);
};

MongoGetter.prototype.get_database = function(options, cb) {
  options = options || {};
  options.database = options.database || "test";

  var self = this;

  this.get_server(options, function(err, server) {
    if (err) {
      cb(err);
      return;
    }

    var skey = options.host + ":" + options.port;

    self.servers[skey].databases[options.database] = self.servers[skey].databases[options.database] || {database: null};

    if (self.servers[skey].databases[options.database].database === null) {
      var database = new self.mongodb.Db(options.database, server);

      database.open(function(err, handle) {
        if (err) {
          cb(err);
          return;
        }

        self.servers[skey].databases[options.database].database = handle;
        self.get_database(options, cb);
      });

      return;
    }

    cb(null, self.servers[skey].databases[options.database].database);
  });
};

MongoGetter.prototype.get_collection = function(options, cb) {
  options = options || {};
  options.collection = options.collection || "test";

  this.get_database(options, function(err, database) {
    if (err) {
      cb(err);
      return;
    }

    database.collection(options.collection, cb);
  });
};

MongoGetter.prototype.get_gridstore = function(options, cb) {
  options = options || {};
  options.filename = options.filename || "test";
  options.mode = options.mode || "r";
  options.options = options.options || {};

  var self = this;

  this.get_database(options, function(err, database) {
    if (err) {
      cb(err);
      return;
    }

    var gridstore = new self.mongodb.GridStore(database, options.filename, options.mode, options.options);
    gridstore.open(cb);
  });
};
