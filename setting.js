/**
 *
 * 基础配置信息;
 * 包含平台启动相关依赖
 * 
 * webSocketAddress为对应socketCuster配置;平台作为一个客户端;
 * auth: liyangli
 * date: 17/2/18 下午1:03 .
 */
"use strict";
var path = require('path');

var setting = {
   
    udp: {
        ip: '239.255.255.249',
        port: 5002,
        sendToPort: 1900,
        httpPort: 5002,
        surveyTime: 3*1000,//探测默认时长
        recive: {
            //接收对象
            ip: '172.17.9.71',
            netmask: '255.255.255.0',
            gateway: '172.17.9.1',
            port: 1900
        }
        
    }
};

module.exports = setting;