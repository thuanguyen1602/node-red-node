module.exports = function(RED) {
    function Decoder2(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.on('input', function(input) {
            const hexString = input.payload;
            const msg = {};
            msg.nodeId = hexString.substring(0, 8);
            msg.temp = parseInt("0x" + hexString.substring(10, 12) + hexString.substring(8, 10)) / 100;
            msg.pressure = parseInt("0x" + hexString.substring(14, 16) + hexString.substring(12, 14)) / 10;
            msg.humidity = parseInt("0x" + hexString.substring(16, 18)) % 128;
            msg.movement = parseInt("0x" + hexString.substring(16, 18)) > 127 ? true : false;
            msg.light = parseInt("0x" + hexString.substring(20, 22) + hexString.substring(18, 20));
            msg.voltage = parseInt("0x" + hexString.substring(22, 24)) / 50;
            msg.checksum = "0x" + hexString.substring(30, 32);
            msg.rssi = parseInt("0x" + hexString.substring(32, 34)) * -1;
            msg.snr = parseInt("0x" + hexString.substring(34, 36)) / 10;

            node.status({fill: "blue", shape: "dot", text: msg.nodeId});
            node.send(msg);
        });
    }
    RED.nodes.registerType("decoder2", Decoder2);
}
