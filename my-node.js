module.exports = function(RED) {
    function MyNode(config) {
        RED.nodes.createNode(this, config);
        const node = this;
        const context = this.context();
        const flow = this.context().flow;
        node.on('input', function(input) {
            // Inputs from user
            const onDelay = config.onDelay;     // 10 Seconds   //input by user in secounds
            const offDelay = config.offDelay;    // 0 Seconds   //input by user in secounds
            let setTopic = config.topic;    //input by user Set Topic Name

            let timeoutFunc = context.get('timeoutFunc') || null;
            let turningOn = context.get('turningOn') || false;
            let turningOff = context.get('turningOff') || false;
            let isOn = context.get('isOn') || false;

            let enabled = null;

            function sendMsg() {
                const payload = {
                    turningOn,
                    turningOff,
                    isOn
                };
                node.send({payload, topic: setTopic});
            }

            if(input.topic === setTopic && input.payload === true) {
                enabled = true;
            }
            else if (input.topic === setTopic && input.payload === false){
                enabled = false;
            }
            else {
                return;
            }

            if(enabled === true) {
                if(turningOff) { /* Was turning off but was switched back on before the off delay elapsed */
                    clearTimeout(timeoutFunc);
                    turningOff = false;
                    isOn = true;
                    context.set('turningOff', turningOff);
                    context.set('isOn', isOn);
                    node.status({fill:"green",shape:"dot",text:enabled});
                    flow.set(setTopic, true);
                    sendMsg();
                } else if(!turningOn && !isOn) {  /* Not turning on and not on, so start turning on */
                    turningOn = Date.now();
                    context.set('turningOn', turningOn);
                    const timeRemaining = (onDelay - (Date.now() - turningOn)) / 1000;
                    node.status({fill:"yellow",shape:"dot",text: "On in " + timeRemaining + " seconds"});
                    timeoutFunc = setTimeout(function(){
                        isOn = true;
                        turningOn = false;
                        context.set('isOn', isOn);
                        context.set('turningOn', turningOn);
                        node.status({fill:"green",shape:"dot",text:enabled});
                        flow.set(setTopic, true);
                        sendMsg();
                    }, onDelay);
                    context.set('timeoutFunc', timeoutFunc);
                    flow.set(setTopic, false);
                    node.send({
                        payload: false,
                        topic: setTopic
                    });
                } else if(turningOn && !isOn) { /* Is turning on but isn't on yet */
                    const timeRemaining = (onDelay - (Date.now() - turningOn)) / 1000;
                    node.status({fill:"yellow",shape:"dot",text: "On in " + timeRemaining + " seconds"});
                    flow.set(setTopic, false);
                    node.send({
                        payload: false,
                        topic: setTopic
                    });
                } else {  /* Is already on */
                    node.status({fill:"green",shape:"dot",text:enabled});
                    flow.set(setTopic, true);
                    sendMsg();
                }
            } else if(enabled === false) {
                if(turningOn) { /* Was turning on but was switched back off before the on delay elapsed */
                    clearTimeout(timeoutFunc);
                    turningOn = false;
                    isOn = false;
                    context.set('turningOn', turningOn);
                    context.set('isOn', isOn);
                    node.status({fill:"red",shape:"dot",text:enabled});
                    flow.set(setTopic, false);
                    sendMsg();
                } else if(!turningOff && isOn) {  /* Not turning off and is on, so start turning off */
                    turningOff = Date.now();
                    context.set('turningOff', turningOff);
                    const timeRemaining = (offDelay - (Date.now() - turningOff)) / 1000;
                    node.status({fill:"yellow",shape:"dot",text: "Off in " + timeRemaining + " seconds"});
                    timeoutFunc = setTimeout(function(){
                        isOn = false;
                        turningOff = false;
                        context.set('isOn', isOn);
                        context.set('turningOff', turningOff);
                        node.status({fill:"red",shape:"dot",text:enabled});
                        flow.set(setTopic, false);
                        sendMsg();
                    }, offDelay);
                    context.set('timeoutFunc', timeoutFunc);
                    flow.set(setTopic, true);
                    node.send({
                        payload: true,
                        topic: setTopic
                    });
                } else if(turningOff && isOn) { /* Is turning off but isn't off yet */
                    const timeRemaining = (offDelay - (Date.now() - turningOff)) / 1000;
                    node.status({fill:"yellow",shape:"dot",text: "Off in " + timeRemaining + " seconds"});
                    flow.set(setTopic, true);
                    node.send({
                        payload: true,
                        topic: setTopic
                    });
                } else { /* Is already off */
                    node.status({fill:"red",shape:"dot",text:enabled});
                    flow.set(setTopic, false);
                    sendMsg();
                }
            }
        });
    }
    RED.nodes.registerType("my-node", MyNode);
}