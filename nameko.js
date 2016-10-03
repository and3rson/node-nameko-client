var events = require('events');
var amqp = require('amqp');
var uuid = require('uuid');
var winston = require('winston-color');

// TODO:
// - Add timeouts
// - Add more error handlers
// - Implement BROADCAST messages

var NamekoClient = function(options, cb) {
    var self = this;

    options = options || {};
    this._options = {
        host: options.host || '127.0.0.1',
        port: options.port || 5672,
        exchange: options.exchange || 'nameko-rpc',
        debug_level: options.debug_level || 'info'
    };

    winston.level = this._options.debug_level;

    winston.log('info', 'Creating Nameko client');

    this._conn = amqp.createConnection({
        host: this._options.host,
        port: this._options.port
    });

    this._conn.on('error', function(e) {
        console.log('AMQP error:', e);
    });

    this._callbacks = {};

    this._conn.on('ready', function() {
        winston.log('debug', 'Connected to %s:%d', self._options.host, self._options.port);

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
            winston.log('error', 'Exchange error: %s', e);
        });
        self._exchange.on('open', function() {
            winston.log('debug', 'Selected exchange %s', self._options.exchange);

            self._responseQueueName = 'rpc-node-response-' + uuid.v4();
            var ctag;

            var replyQueue = self._conn.queue(self._responseQueueName, {
                exclusive: true
            }, function(replyQueue) {
                winston.log('debug', 'Connected to reply queue %s', self._responseQueueName);

                replyQueue.bind(self._options.exchange, self._responseQueueName);

                replyQueue.subscribe(function(message, headers, deliveryInfo, messageObject) {
                    cid = messageObject.correlationId;
                    callback = self._callbacks[cid];
                    if (callback) {
                        winston.log('info', '[%s] Received response', cid);
                        callback(message.error, message.result);
                    } else {
                        winston.log('error', '[%s] Received response with unknown cid!', cid);
                    }
                    delete self._callbacks[cid];
                }).addCallback(function(ok) {
                    ctag = ok.consumerTag;

                    winston.log('info', 'Nameko client ready!');

                    self.emit('ready', self);
                    cb && cb(self);
                });
            });
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

        var correlationId = uuid.v4();
        var ctag;

        winston.log('info', '[%s] Calling %s.%s(...)', correlationId, service, method);

        self._callbacks[correlationId] = callback;
        self._exchange.publish(
            service + '.' + method,
            JSON.stringify(body),
            {
                contentType: 'application/json',
                replyTo: self._responseQueueName,
                headers: {
                    // TODO: Research WTF is 'bar'
                    'nameko.call_id_stack': 'standalone_rpc_proxy.call.' + 'bar'
                },
                correlationId: correlationId,
                exchange: self._options.exchange
            }
        );
    }
};

NamekoClient.prototype.__proto__ = events.EventEmitter.prototype;

var connect = function(options, cb) {
    return new NamekoClient(options, cb);
};

exports.NamekoClient = NamekoClient;
exports.connect = connect;
