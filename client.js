/**
 *
 * udp客户端.
 * auth: liyangli
 * date: 17/5/16 上午9:45 .
 */
"use strict";
const dgram = require('dgram');

const socket = dgram.createSocket('udp4');

class UdpClient{
    constructor(){
        socket.bind(()=>{
            socket.setBroadcast(true);
        });
    }
    
    send(msg,port,ip){
        var message = new Buffer(msg);
        socket.send(message,0,message.length,port,ip,(err,bytes)=>{
            console.info(new Buffer(bytes).toLocaleString());
        });

    }
}






module.exports = UdpClient;