module.exports = function(RED) {
    function Decoder(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.on('input', function(input) {
            const hexString = input.payload;
            const msg = {};
            msg.nodeId = hexString.substring(0, 8);
            msg.voltage = parseInt("0x" + hexString.substring(22, 24)) / 50;
            msg.pulses = parseInt("0x" +  hexString.substring(8, 16));
            msg.temp = parseInt("0x" + hexString.substring(28, 30) + hexString.substring(26, 28)) / 100;
            msg.rssi = parseInt("0x" + hexString.substring(32, 34)) * -1;
            msg.snr = parseInt("0x" + hexString.substring(34, 36)) / 10;

            node.status({fill: "blue", shape: "dot", text: msg.nodeId});
            node.send(msg);
        });
    }
    RED.nodes.registerType("decoder", Decoder);
}
