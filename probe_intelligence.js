/**
 * 智能探针。主要模拟具体137.进行自动作为设备发现使用;
 * 处理逻辑。
 * 1、开启一个组播服务进行监听指定组播数据。
 * 2、获取相关数据后直接发送单播数据给指定位置服务器进行注册本地探针
 * 3、http方式建立相关连接;
 * 4、相关通讯数据模拟发送
 *
 * auth: liyangli
 * date: 17/5/24 下午6:15 .
 */
"use strict";

const UdpServer = require('./server');
const EventEmitter = require('events');
const UdpClient = require('./client');
const http = require('http');
const fs = require('fs');

class ProbeIntell{
    constructor(){
        //建立对应server服务;
        const ev = new EventEmitter();
        new UdpServer.UdpRevice(ev);
        this.udpClient = new UdpClient();
        const self = this;
        ev.on("udpDealFinish",(result)=>{
            console.info("udpDeal Finish;接收到数据为->%s",JSON.stringify(result));

           // const netObj = self._findNet(result);
            const netObj = {
                ip: result.eths[0].ip,
                port: result.port
            };
            //先判断对应连接是否存在。不存在执行下面操作;如果存在不做任何处理;
            if(self.httpConn){
                if(self.httpConn)
                console.info("相关http连接已经存在。不需要再进行连接操作了。");
                return;
            }
           //进行发送单播数据
            self._probeMultliSend(netObj);
            //同时进行建立http连接
            self._makeHttpConn(netObj,ev);
        });
    }

    init(){
        //初始化方法。进行设定
        //进行判断对应文件是否存在。如果存在路径直接进行设定http连接；
        fs.readFile('config.json',(err,data)=>{
            if(err){
                console.error(err);
                return;
            }else{
                console.info(data);
                const configObj = JSON.parse(data);

                //进行直接连接对应http处理；
                this._makeHttpConn(configObj,this.ev);
                
            }
        })
    }

    /**
     * 获取相关的网络对象;主要进行设定对应
     * @param result
     * @private
     */
    _findNet(result){
        //需要进行获取本地网口和对应交互通讯网口在一致的范围之内进行通讯;
        const netObj = result[0];
        return netObj;
    }

    /**
     * 对应发送单播数据;把相关探针信息发送过去。
     * @param netObj 单播对象网口
     * @private
     */
    _probeMultliSend(netObj){
        const sendObj = {
            "protocolType": "adapterProbe",
            "ip": "127.0.0.1",
            "deviceName": "adapter",
            "deviceType": "",
            "mac":"00:e0:2f:1d:22:62"
        };
        this.udpClient.send(JSON.stringify(sendObj),netObj.port,netObj.ip);
    }

    /**
     * 创建和服务器端的长连接;主要进行设定后续数据的发送操作;
     * @param netObj
     * @private
     */
    _makeHttpConn(netObj,ev){
        //表明建立了对应连接
        console.info("===============netObj===============");
        //需要进行把数据保存到配置文件中。下次启动时直接自动连接上；
        console.info(netObj);
        fs.writeFile('config.json',JSON.stringify(netObj),(err)=>{
            if(err){
                console.error("保存文件时出错了，错误信息为->"+err);
            }
        });
        console.info("================netObj end ===========");
       try{
          this.httpConn =  new UdpServer.HttpClient(netObj.ip,netObj.port,ev);
       }catch(e){
           console.error(e);
           //如果出现失败了。每1秒尝试1次
           const self = this;
           setTimeout(()=>{
                self._makeHttpConn(netObj,ev);
           },1000);
       } 
       
    }

}

module.exports = ProbeIntell;
