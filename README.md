`node-nameko-client` is a library for interacting with [Nameko] microservices framework.

## Usage

This example connects to `RabbitMQ` and calls `send_mail` method from `mailer` service:

    var nameko = require('node-nameko-client');

    nameko.connect({host: '127.0.0.1', port: 5672}).on('ready', function(rpc) {
        rpc.call('mailer', 'send_mail', ['foo@example.org', 'Hello!', 'It\'s been a lo-o-o-ong time.'], {}, function(e, r) {
            if (e) {
                console.log('Oops! RPC error:', e);
            } else {
                res.send('Success: Result is', r);
            }
        });
    });

## Installation

    npm install django-nameko-client

## Methods

### `.connect([config])`

This method takes one optional argument: a config object.
Allowed keys are:

  - `host` - RabbitMQ host (default: `127.0.0.1`)
  - `host` - RabbitMQ port (default: `5672`)
  - `exchange` - RabbitMQ exchange (default: `nameko-rpc`)

### `.call(service_name, method_name, [args, [kwargs, [callback]]])`

Performes RPC call by sending event to the appropriate RabbitMQ queue.
`args` should be a list, `kwargs` should be an object.
A `callback` will be called once a method is complete.

## Using with ExpressJS

They also plays together well:

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

- Reusing reply queues for better performance
- Adding support for event broadcasting (e. g. BROADCAST & SINGLETON message types)
- Adding tests
- Fixing some unknown hard-coded values (yes, I need to RTFM)

## License

The license is MIT.

## Issues

Any contribution is highly appreciated!
Feel free to submit an issue here: <https://github.com/and3rson/node-nameko-client/issues>.

[Nameko]: https://github.com/onefinestay/nameko
