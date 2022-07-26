var amqp = require('amqplib/callback_api');
const amqplib = require('amqplib');
const { v4: uuidvv4 } = require('uuid')

var args = process.argv.slice(2);

if (args.length == 0) {
  console.log("Usage: client.js url");
  process.exit(1);
}

const url = args[0];
const uuid = uuidvv4()

const scrapeURL = async () => {
    const connection = await amqplib.connect('amqp://localhost');
    const channel = await connection.createChannel();
    const q = await channel.assertQueue('', {exclusive: true});

    console.log(' [x] Requesting image and summary');

    channel.sendToQueue('rpc_queue', Buffer.from(url), {
        replyTo: q.queue,
        correlationId: uuid
    });

    channel.consume(q.queue, msg => {
        if (msg.properties.correlationId == uuid){
            console.log('[.] Got %s', msg.content.toString());
            setTimeout(() => {
                connection.close();
                process.exit(0);
            }, 500)
        }
    }, {noAck: true});
}

scrapeURL();

