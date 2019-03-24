module.exports = function(RED) {
    function LowerCaseNode(config) {
        RED.nodes.createNode(this,config);
        var node = this;
        node.on('input', function(input) {
            // Inputs from user
            const onDelay = config.onDelay;
            const offDelay = config.offDelay;
            let setTopic = config.topic;

            const context = this.context();
            const flow = this.context().flow;

            let timeoutFunc = context.get('timeoutFunc') || null;
            let turningOn = context.get('turningOn') || false;
            let turningOff = context.get('turningOff') || false;
            let isOn = context.get('isOn') || false;
            let enabled = null;

            function sendMsg() {
                node.send({payload: {
                    turningOn,
                    turningOff,
                    isOn,
                    topic: setTopic
                }});
            }
            if(config.topic === setTopic && input.payload === true) {
                enabled = true;
            }
            else if (config.topic === setTopic && input.payload === false){
                enabled = false;
            }
            else {
                return;
            }

            if(enabled === true) {
                if(turningOff) {
                    clearTimeout(timeoutFunc);
                    turningOff = false;
                    isOn = true;
                    context.set('turningOff', turningOff);
                    context.set('isOn', isOn);
                    node.status({fill:"green",shape:"dot",text:enabled});
                    flow.set(setTopic, true);
                    sendMsg();
                } else if(!turningOn && !isOn) {
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
                } else if(turningOn && !isOn) {
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
                if(turningOn) {
                    clearTimeout(timeoutFunc);
                    turningOn = false;
                    isOn = false;
                    context.set('turningOn', turningOn);
                    context.set('isOn', isOn);
                    node.status({fill:"red",shape:"dot",text:enabled});
                    flow.set(setTopic, false);
                    sendMsg();
                } else if(!turningOff && isOn) {
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
                } else if(turningOff && isOn) {
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
    RED.nodes.registerType("my-node", LowerCaseNode);
}
