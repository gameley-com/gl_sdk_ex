"use strict";
exports.__esModule = true;
var YouziData_1 = require("./YouziData");
var YouziMultipleMainPush_1 = require("./YouziMultipleMainPush");
var YouziMultipleMainPushManager = /** @class */ (function () {
    /**
     *
     * @param jsonArray jso你数组，格式：[{parentNode:node,x:0,y:0}],parentNode:主推父节点，x，y为主推节点坐标
     * @param amount 主推数量
     */
    function YouziMultipleMainPushManager(jsonArray) {
        //多主推个数
        this.multipleAmount = 1;
        this.isUpdateMainPush = false;
        //创建的多主推
        this.multipleMainPushObj = [];
        //多主推父节点参数json数组
        this.paramsJsonArray = [];
        //从主推数组中随机取出几个元素的数组
        this.randomData = [];
        this.startTimerMulti = true;
        this.paramsJsonArray = jsonArray;
        this.initShow();
    }
    YouziMultipleMainPushManager.prototype.initShow = function () {
        if (YouziData_1.YouziData._isDataLoaded) {
            this.creatYouziMultipleMainPush();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.creatYouziMultipleMainPush.bind(this));
        }
    };
    YouziMultipleMainPushManager.prototype.creatYouziMultipleMainPush = function () {
        var amountArr = YouziData_1.YouziData.getMultiMainAmount(this.paramsJsonArray.length);
        this.multipleAmount = amountArr[0];
        this.isUpdateMainPush = amountArr[1];
        this.randomData = YouziData_1.YouziData.getGamesIndex(YouziData_1.YouziData.mainRecDatas.length, this.multipleAmount);
        for (var i = 0; i < this.randomData.length; i++) {
            var multipleMainPush = new YouziMultipleMainPush_1["default"](YouziData_1.YouziData.mainRecDatas[this.randomData[i]]);
            var paramsJson = this.paramsJsonArray[i];
            if (this.paramsJsonArray[i]) {
                multipleMainPush.setYouziPosition(paramsJson.x, paramsJson.y);
                paramsJson.parentNode.addChild(multipleMainPush);
                this.multipleMainPushObj.push(multipleMainPush);
            }
        }
        this.startChangeTimeLoop();
    };
    //开启计时器，进行更换
    YouziMultipleMainPushManager.prototype.startChangeTimeLoop = function () {
        if (this.startTimerMulti) {
            this.startTimerMulti = false;
            if (this.isUpdateMainPush) {
                Laya.timer.loop(5000, this, this.updateMultipleMainPush);
            }
            for (var k = 0; k < this.multipleMainPushObj.length; k++) {
                this.multipleMainPushObj[k].startTimerLoop();
            }
        }
    };
    //停止计时器，停止更换
    YouziMultipleMainPushManager.prototype.stopChangeTimeLoop = function () {
        if (this.isUpdateMainPush) {
            Laya.timer.clear(this, this.updateMultipleMainPush);
        }
        for (var l = 0; l < this.multipleMainPushObj.length; l++) {
            this.multipleMainPushObj[l].clearTimerLoop();
        }
        this.startTimerMulti = true;
    };
    YouziMultipleMainPushManager.prototype.updateMultipleMainPush = function () {
        this.randomData = YouziData_1.YouziData.getGamesIndex(YouziData_1.YouziData.mainRecDatas.length, this.multipleAmount);
        for (var j = 0; j < this.multipleMainPushObj.length; j++) {
            this.multipleMainPushObj[j].updateMainRecMultiple(YouziData_1.YouziData.mainRecDatas[this.randomData[j]]);
        }
    };
    return YouziMultipleMainPushManager;
}());
exports["default"] = YouziMultipleMainPushManager;
