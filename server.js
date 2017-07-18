/**
 *
 * udp服务器类。主要在指定位置进行接受对应数据
 * 
 * 主要进行模拟对应137进行处理
 * 
 * auth: liyangli
 * date: 17/5/16 上午9:27 .
 */
"use strict";
const setting = require('./setting');
/**
 * udp接收处理类
 */
class UdpRevice{
    constructor(ev){
        const dgram = require('dgram');
        const serverSocket = dgram.createSocket('udp4'); 
        this._init(serverSocket,ev);
    }
    
    _init(serverSocket,ev){
        serverSocket.on('message',function(msg,rinfo){
            //表明获取对应数据。需要进行处理;
            console.info(msg.toString());
            msg = JSON.parse(msg);

            //通知数据处理完成。开始做其他工作
            ev.emit("udpDealFinish",msg);
            //serverSocket.close();

        });

        serverSocket.on('error',function(err){
            console.log('error,msg - %s,stack - %s\n',err.message,err.stack);
        });

        serverSocket.on('listening',()=>{
            console.log('echo server is listening on port 5001.');
        });

        serverSocket.bind(setting.udp.sendToPort,()=>{
            //设定对应组播方式绑定的地址
            serverSocket.addMembership(setting.udp.ip);
        });
    }
}

const http = require('http');
/**
 * http客户端发送设备相关数据
 */
class HttpClient{
    
    constructor(ip,port,ev){
        const self = this;
        this.req = http.request({
            host: ip,
            port: port,
            path:"/",
            method: "post",
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }, (res)=>{
            //发送成功;
            res.setEncoding('utf8');
            ev.on("reviceEventName",function(obj){
                //需要获取对应obj中的msgID;然后进行返回对应数据；
                console.info(obj);
                //进行发送ok。完成；
                const msgID = obj.msgID;
                //组装需要回应的数据
                self.send({msgID: msgID,protocolType: obj.protocolType,errCode: 0,desc:'success'});

            });

            new ReceiveDeal(c,ev);
        }); 
        
        this.ev = ev;
    }

     /**
     * 发送具体的数据
     * @param conn
     * @param sendContent
     * @private
     * @return string 事件监听的属性;主要组成方式sendObj.protocolType+"_"+sendObj.msgID
     */
    _send(conn,sendContent){
        sendContent = JSON.stringify(sendContent);
        //获取对一个字符长度
        let contentLen = new Buffer(sendContent).length;
        let msg = this._setHeader(contentLen)+"\r\n"+sendContent;
        conn.write(msg);
    }

    _setHeader(len){
        var msg = `HTTP/1.1 200 OK
Connection: keep-alive
Content-Length: ${len}
Content-Type: application/json;charset=UTF-8\r\n`;
        return msg;
    }
    send(content){
        //作为一个http客户端进行设定;
        this._send(this.req,content);
        
        this.ev.on("sendFinish",(result)=>{
            console.info("sendFinish->"+result);
        })
        
    }
}
/**
 * 发送具体的数据。防止闭包情况下出现问题;
 */
class ReceiveDeal{
    constructor(httpConn,ev){
        this.httpConn = httpConn;
        this.ev = ev;
        this._receive();
    }

    _receive(){
        const self = this;

        //根据超时时间进行判断。如果下超时时间内没有响应数据就直接返回没有数据。否则直接返回对应数据;
        let msg = "";
        //设定一个对象。设定一个上下文数据;

        this.httpConn.on('data',(data)=>{
            //包含的场景:1、完整数据;2、不全数据;3、多个完整数据;4、多个数据但最后一个不完整


            //开启具体定时处理任务,如果尝试长时间没有设定表明就被重置了;
            msg += data.toString();
            //1、进行数据通过http头方式进行分割
            let prefixMsg = "HTTP/1.1 200 OK";
            const httpMsgs = msg.split(prefixMsg);
            //需要把msg 制空;主要针对后续数据在设定时再针对msg进行赋值;
            
            console.info(`*****************协议接收数据 start(${moment().format("YYYY-MM-DD HH:mm:ss")})******************************`);
            console.info(msg);
            console.info("------------------------------------------------------");
            msg = "";
            for(let httpMsg of httpMsgs){
                if(!httpMsg){
                    continue;
                }
                //1、判断对应请求头是否接收完毕;
                httpMsg = prefixMsg+httpMsg;
                let bodyStart = httpMsg.indexOf("\r\n\r\n");
                if(bodyStart == -1){
                    //表明还没有完成;
                    msg = prefixMsg+httpMsg;
                    continue;
                }

                //请求头完成了。需要进行判读对应内容的长度
                let headObj = qs.parse(httpMsg,'\r\n',":");
                let contentLen = headObj["Content-Length"];
                if(contentLen == 0){
                    //表明响应没有数据;该情况理论上是不存在的;
                    console.error("接收到的内容体为空,请求的协议为->"+httpMsg);
                    continue;
                }
                //表明含有具体的数据了,需要判断对应内容体的长度是否到达content-length长度;
                //通过内容体进行判断数据是否接收完毕。如果没有接收完毕等待。否则直接解析
                const reviceMsg = httpMsg.substr(bodyStart+4);
                if(new Buffer(reviceMsg).length != contentLen){
                    //表明没有接收完全
                    msg = prefixMsg + httpMsg;
                    continue;
                }

                
                console.info(`======================单个协议接收 start(${moment().format('YYYY-MM-DD HH:mm:ss')})=====================`);
                console.info(reviceMsg);
                console.info("======================单个协议接收 end=====================");
                try{
                    const reviceObj = JSON.parse(reviceMsg);
                    self.ev.emit("reviceEventName",null,reviceObj);
                }catch(e){
                    console.error("解析接收的数据出错了,接收到的数据为->"+reviceMsg);
                    throw e;
                }
                


            }
            console.info(`*****************协议接收数据 end******************************`);
        });
    }
}



/*ev.on('udpDealFinish',(result)=>{
    const httpClient = new HttpClient();
    httpClient.send(result);
});

new UdpRevice();*/

module.exports = {
    UdpRevice: UdpRevice,
    HttpClient: HttpClient
};





