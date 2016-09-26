var events = require('events');
var amqp = require('amqp');
var uuid = require('uuid');

// TODO:
// - Add timeouts
// - Add more error handlers
// - Implement BROADCAST messages

var NamekoClient = function(host, port, options, cb) {
    var self = this;

    this._conn = amqp.createConnection({
        host: host,
        port: port
    });

    options = options || {};
    this._options = {
        exchange: options.exchange || 'nameko-rpc'
    };

    this._conn.on('error', function(e) {
        console.log('AMQP error:', e);
    });

    this._conn.on('ready', function() {
        self._exchange = self._conn.exchange(
            self._options.exchange,
            {
                // TODO: can we somehow mirror exchange settings from RabbitMQ?
                type: 'topic',
                durable: true,
                autoDelete: false
            }
        );
        self._exchange.on('error', function(e) {
            console.log('Exchange error', e);
        });
        self._exchange.on('open', function() {
            self.emit('ready', self);
            cb && cb(self);
        });
    });
};

NamekoClient.prototype = {
    call: function(service, method, args, kwargs, callback) {
        var self = this;
        var options = this._options;

        var body = {
            args: args || [],
            kwargs: kwargs || {}
        };

        var responseQueueName = 'rpc-node-response-' + uuid.v4();

        var correlationId = uuid.v4();
        var ctag;

        var replyQueue = self._conn.queue(responseQueueName, {
            exclusive: true
        }, function(replyQueue) {
            replyQueue.bind(self._options.exchange, responseQueueName);

            // TODO: reuse queues by storing them in queue pool
            // and using correlationId for response matching
            replyQueue.subscribe(function(message, headers, deliveryInfo, messageObject) {
                callback(message.error, message.result);
                replyQueue.unsubscribe(ctag);
            }).addCallback(function(ok) {
                ctag = ok.consumerTag;

                self._exchange.publish(
                    service + '.' + method,
                    JSON.stringify(body),
                    {
                        contentType: 'application/json',
                        replyTo: responseQueueName,
                        headers: {
                            // TODO: Research WTF is 'bar'
                            'nameko.call_id_stack': 'standalone_rpc_proxy.call.' + 'bar'
                        },
                        correlationId: correlationId,
                        exchange: self._options.exchange
                    }
                );
            });
        });
    }
};

NamekoClient.prototype.__proto__ = events.EventEmitter.prototype;

var connect = function(host, port, options, cb) {
    return new NamekoClient(host, port, options, cb);
};

exports.NamekoClient = NamekoClient;
exports.connect = connect;
