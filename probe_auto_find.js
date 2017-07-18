/**
 *
 * 探针自动发现;
 * auth: liyangli
 * date: 17/5/24 下午6:09 .
 */
"use strict";
const express = require('express');
const request = require('supertest');
const setting = require('./../../backend/config/setting');
describe("探针自动发现功能测试",
    function() {
        var server;
        beforeEach(function () {
            //对应运行的文件
            server = require('./../../bin/vsiaServer');

        });
        afterEach(function () {
            server.close();
        });
        /**
         * 处理流程;
         * 1、进行通过模拟访问开启扫描功能;(后台自动创建udp服务了)
         * 2、对应模拟创建一个探针客户端结束相关数据。然后发送单播数据给平台,主要进行把该探针进行注册上去
         * 3、对应数据能够正常入库和修改
         */
        it('autoFind',function(done){
           request(server).post('/udp/device/surveyStart')
               .send({
                   monitorID: 1
               })
               .expect(200).end(function(req,res){
                //表明成功了。进行开启我们的 
               console.info(res.body);
               setTimeout(function(){
                   done();
               },setting.udp.surveyTime);
           });
        });
    
    }
);
