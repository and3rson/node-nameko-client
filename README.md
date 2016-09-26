`node-nameko-client` is a library for interacting with [Nameko] microservices framework.

## Usage

This example connects to `RabbitMQ` and calls `send_mail` method from `mailer` service:

    var nameko = require('./node-nameko-client');

    nameko.connect({host: '127.0.0.1', port: 5672}).on('ready', function() {
        nameko.call('mailer', 'send_mail', [], {}, function(e, r) {
            if (e) {
                console.log('Oops! RPC error:', e);
            } else {
                res.send('Success: Result is', r);
            }
        });
    });

## Installation

    npm install django-nameko-client

## Configuration

`connect()` method may take no arguments or single config object.
Allowed keys are:

  - `host` - RabbitMQ host (default: `127.0.0.1`)
  - `host` - RabbitMQ port (default: `5672`)
  - `exchange` - RabbitMQ exchange (default: `nameko-rpc`)

## Using with ExpressJS

They also plays together well:

    var nameko = require('./node-nameko-client');
    var express = require('express');

    var app = express();
    var nameko = nameko.connect({host: '127.0.0.1', port: 5672});

    nameko.on('ready', function() {
        console.log('Connected to AMQP.');

        app.listen(9000, function() {
            console.log('Server started on port 9000.');
        });
    });

    app.get('/', function(req, res) {
        nameko.call('mailer', 'ping', [], {}, function(e, r) {
            if (e) {
                res.send('Oops! RPC error: ' + e);
            } else {
                res.send('Success: Result is ' + r);
            }
        });
    });

## License

The license is MIT.

## Issues

Feel free to submit an issue here: <https://github.com/and3rson/node-nameko-client/issues>.

[Nameko]: https://github.com/onefinestay/nameko
