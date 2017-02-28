var namekoFactory = require('./nameko');

namekoFactory.connect().then((namekoClient) => {
    namekoClient.call('mailer', 'ping', [], {}, (e, r) => {
        console.log('Error:', e ? e.message : e, 'Result:', r);
    });
    namekoClient.call('mailer', 'pinga', [], {}, (e, r) => {
        console.log('Error:', e ? e.message : e, 'Result:', r);
    });
    namekoClient.call('mailer', 'ping').then(r => {
        console.log('Success:', r);
    }).catch(e => {
        console.log('Error:', e.message);
    });
    namekoClient.call('mailer', 'pinga').then(r => {
        console.log('Success:', r);
    }).catch(e => {
        console.log('Error:', e.message);
    });
});
