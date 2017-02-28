`node-nameko-client` is a library for interacting with [Nameko] microservices framework.

## Usage

This example connects to `RabbitMQ` and calls `send_mail` method from `mailer` service:

    var nameko = require('node-nameko-client');

    nameko.connect({host: '127.0.0.1', port: 5672}).on('ready', function(rpc) {
        rpc.call('mailer', 'send_mail', ['foo@example.org', 'Hello!', 'It\'s been a lo-o-o-ong time.'], {}, function(e, r) {
            if (e) {
                console.log('Oops! RPC error:', e);
            } else {
                console.error('Success: Result is', r);
            }
        });
    });

    // You can also use promises. Here's an example with promises & ES6 syntax:

    nameko.connect({host: '127.0.0.1', port: 5672})
        .then(
            rpc => rpc.call('mailer', 'send_mail', ['foo@example.org', 'Hello!', 'It\'s been a lo-o-o-ong time.']);
        )
        .then(
            result => console.log('Success: Result is', result);
        )
        .catch(
            error => console.error('Oops! RPC error:', error.stack);
        )
    ;

## Installation

    npm install node-nameko-client

## Methods

### `.connect([config, [callback, [onError]]])`

This method takes one optional argument: a config object.
Allowed keys are:

  - `host` - RabbitMQ host (default: `"127.0.0.1"`)
  - `port` - RabbitMQ port (default: `5672`)
  - `login` - RabbitMQ username (default: `null`)
  - `password` - RabbitMQ password (default: `null`)
  - `exchange` - RabbitMQ exchange (default: `"nameko-rpc"`)
  - `timeout` - Timeout for waiting for response (in ms, default: `5000`)
  - `debug_level` - Debug level. Choices are `"debug"`, `"info"`, `"warning"` or `"error"` (default: `"debug"`). Has no effect if `logger` is provided (see below.)
  - `logger` - Custom logger to use (default: `null`). `debug_level` will have no effect if you provide it.

`callback` is called when the connection succeeds, `onError` is called when a connection error occurs.

If `callback` is not provided then this method returns `Promise`.


### `.call(service_name, method_name, [args, [kwargs, [callback(e, r)]]])`

Performs RPC call by sending event to the appropriate RabbitMQ queue.
`args` should be a list or `undefined`, `kwargs` should be an object or `undefined`.

If a `callback` is provided it will be called once a method is complete.
Otherwise this method returns `Promise`.

## Using with ExpressJS

They also play well together:

    var nameko = require('node-nameko-client');
    var express = require('express');

    var app = express();
    var rpc = nameko.connect({host: '127.0.0.1', port: 5672});

    rpc.on('ready', function() {
        console.log('Connected to AMQP.');

        app.listen(9000, function() {
            console.log('Server started on port 9000.');
        });
    });

    app.get('/', function(req, res) {
        rpc.call('mailer', 'ping', ['foo@example.org', 'Hello!', 'It\'s been a lo-o-o-ong time.'], {}, function(e, r) {
            if (e) {
                res.send('Oops! RPC error: ' + e);
            } else {
                res.send('Success: Result is ' + r);
            }
        });
    });

## What's on the roadmap?

- [x] Promises
- [x] Reusing reply queues for better performance
- [ ] Fixing some unknown hard-coded values (already have information from [Nameko] devs regarding this, will fix soon)
- [ ] Adding support for event broadcasting (e. g. BROADCAST & SINGLETON message types)
- [ ] Adding tests

## License

The license is MIT.

## Issues

Any contribution is highly appreciated!
Feel free to submit an issue here: <https://github.com/and3rson/node-nameko-client/issues>.

[Nameko]: https://github.com/onefinestay/nameko
