module.exports = function(RED) {
    function CheckSum(config) {
        const node = this;
        RED.nodes.createNode(this, config);
        node.on('input', function(input) {
            const msg = {
                payload: input.payload
            };
            const hexString = msg.payload;

            const dChecksum = parseInt(hexString.substring(26, 28), 16);
            let pChecksum = 0;

            for (i = 0; i < 13; i++) {
                const currentbyte = parseInt(hexString.substring((i * 2), (i * 2 + 2)), 16);
                pChecksum ^= currentbyte;
            }

            if (dChecksum != pChecksum) {
                msg.checksumflag = false;
            } else {
                msg.checksumflag = true;
                msg.checksumcheck = hexString.substring(26, 28);
            }

            msg.messageVersion = parseInt("0x" + hexString.substring(2, 4));

            switch (msg.messageVersion) {
                case 170: { // AA identifies the Micro Edge LR-4
                    node.send([ msg, null, null, null, null ]);
                    break;
                }
                case 171: { // AB identifies the Droplets with the old firmware
                    node.send([null, msg, null, null, null]);
                    break;
                }
                case 176: {// B0 identifies the Droplet DL-TH Sensor
                    node.send([null, null, msg, null, null]);
                    break;
                }
                case 177: {// B1 identifies the Droplet DL-THL Sensor
                    node.send([null, null, null, msg, null]);
                    break;
                }
                case 178: { // B2 identifies the Droplet DL-THLM Sensor
                    node.send([null, null, null, null, msg]);
                    break;
                }
            }
        })
    }
    RED.nodes.registerType("check-sum", CheckSum);
}
