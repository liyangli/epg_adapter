/**
 * 处理逻辑：
 * A\基础功能
 * 1、接收udp数据
 * 2、发送udp组播数据；
 * 3、发送http链接
 * 
 * B、智能处理
 * 1、接收码表数据后返回成功；
 * 2、接收按键数据后返回成功；
 * 3、接收开启信令动作后主动上报信令数据；
 */
'use static';
const fs = require('fs');
const ProbeIntel = require('./probe_intelligence');
const probeIntel = new ProbeIntel();
probeIntel.init();