var Knex = require('knex');
var objection = require('objection');
var Model = objection.Model;

module.exports = function (opts) {
  var __knex;
  return function *knex(next) {
    var conn = opts.connection || { };
    var env = process.env;
    if(!__knex) {
      __knex = Knex({
        client: opts.client,
        debug: opts.debug || env.KOA_KNEX_DEBUG,
        connection: {
          host: conn.host || env.KOA_KNEX_HOST,
          port: conn.port || env.KOA_KNEX_PORT || 5432,
          user: conn.user || env.KOA_KNEX_USER,
          password: conn.password || env.KOA_KNEX_PASSWORD,
          database: conn.database || env.KOA_KNEX_DATABASE,
          charset: conn.charset || env.KOA_KNEX_CHARSET,
          ssl: conn.ssl || env.KOA_KNEX_SSL,

          /** For SQLite 3: http://knexjs.org/#Initialize */
          filename: conn.filename || env.KOA_KNEX_FILENAME
        }
      });
      Model.knex(__knex);
    }

    yield next;
  };
};