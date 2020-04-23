var assert = require('chai').assert;
var sinon = require('sinon');
var Promise = require('bluebird');
var Connection = require('../../src/connection');
var Client = require('../../src/client');

describe('Client tests', function() {

  it('is created correctly', function() {
    var client = new Client('address', {foo: 'bar'});
    assert.equal(client._address, 'address');
    assert.deepEqual(client._options, {foo: 'bar'});
  });

  it('creates an opened connection with real server', function(done) {
    if (process.env.JANUS_URL) {
      var client = new Client(process.env.JANUS_URL, { keepalive: true });
      let connection = null;
      client.createConnection('123')
        .then(function(conn) {
          connection = conn;

          connection.requestServerInfo().then(res => {
            assert.notEqual(res.get('server-name'), "");
            done()
          }).catch(done);
        })
    }
  });

  it('creates an opened connection', function(done) {
    var client = new Client('', {});
    var openPromiseCalled;
    var connectionMock = {
      open: function() {
        openPromiseCalled = true;
        return Promise.resolve(connectionMock);
      }
    };
    sinon.stub(Connection, 'create', function() {
      return connectionMock;
    });

    client.createConnection('')
      .then(function(connection) {
        assert.isTrue(openPromiseCalled);
        assert.strictEqual(connection, connectionMock);
        done();
      })
      .finally(function() {
        Connection.create.restore();
      });
  });

});
