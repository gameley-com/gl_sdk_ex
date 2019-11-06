"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
exports.__esModule = true;
var layaMaxUI_1 = require("../ui/layaMaxUI");
var YouziData_1 = require("./YouziData");
var YouziAtlasPngAnima_1 = require("./YouziAtlasPngAnima");
var YouziMoreGame = /** @class */ (function (_super) {
    __extends(YouziMoreGame, _super);
    function YouziMoreGame() {
        var _this = _super.call(this) || this;
        _this.morelistDatas = [];
        _this.mainItemExposure = {};
        _this.fisrtShow = false;
        _this.isCreate = false;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.curFront = true;
        _this.curBack = false;
        _this.stopAction = false;
        _this.isClick = false;
        _this.dur = 5000;
        _this.centerX = 0;
        _this.centerY = 0;
        _this.visible = false;
        _this.MoreGameUI.visible = false;
        _this.moreGameList.scrollBar.hide = true;
        return _this;
    }
    YouziMoreGame.prototype.setYouziPosition = function (x, y) {
        this.centerX = NaN;
        this.centerY = NaN;
        this.MoreGameUI.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziMoreGame.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMoreGame.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziMoreGame.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziMoreGame.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMoreGame.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziMoreGame.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziMoreGame.prototype.onEnable = function () {
        var isMoreGameOk = YouziData_1.YouziData._isDataLoaded;
        if (isMoreGameOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziMoreGame.prototype.showMoreGameUI = function () {
        if (this.isCreate && !this.visible) {
            this.visible = true;
            this.moreGameList.mouseThrough = false;
            this.MoreGameUI.visible = true;
            this.starMoreGameAction();
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_MoreGame, { uiVisible: true });
            // if(!this.fisrtShow){
            //     this.fisrtShow = true;
            this.checkExposure();
            // }
        }
    };
    YouziMoreGame.prototype.onBtnCloseClicked = function () {
        this.stopMoreGameAcion();
        this.visible = false;
        this.moreGameList.mouseThrough = true;
        this.MoreGameUI.visible = false;
        this.mainItemExposure = {};
        this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_MoreGame, { uiVisible: false });
    };
    YouziMoreGame.prototype.initShow = function () {
        this.moreGameCloseBtn.on(Laya.Event.CLICK, this, this.onBtnCloseClicked);
        if (YouziData_1.YouziData.moreDatas.length > 0) {
            this.morelistDatas = YouziData_1.YouziData.moreDatas;
            var arr = [];
            var pRecord = null;
            for (var i = 0; i < this.morelistDatas.length; i++) {
                pRecord = this.morelistDatas[i];
                if (pRecord.dynamicType == 1 && pRecord.dynamicIcon) {
                    arr.push({ icon: "", namelab: pRecord.title });
                }
                else {
                    arr.push({ icon: pRecord.iconImg, namelab: pRecord.title });
                }
            }
            this.moreGameList.array = arr;
            this.moreGameList.renderHandler = new Laya.Handler(this, this.onListRender);
            this.moreGameList.mouseHandler = new Laya.Handler(this, this.moreGameListMouseEvent);
            this.isCreate = true;
            this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_MoreGame, { complete: true });
            this.dur = this.morelistDatas.length > 12 ? (this.morelistDatas.length - 12) * 5000 : 5000;
        }
    };
    YouziMoreGame.prototype.onListRender = function (item, index) {
        // if(index < this.morelistDatas.length)
        // {
        // console.log('render moregame index:',index);
        if (this.morelistDatas[index].dynamicType == 1 && this.morelistDatas[index].dynamicIcon) {
            var imgAnima = item.getChildByName('iconAnima');
            imgAnima.scale(1.16, 1.16);
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima_1["default"]();
            youziAnima.createAnimation(this.morelistDatas[index].dynamicIcon, 
            // imgAnima,
            function (anima) {
                imgAnima.frames = anima.frames;
                imgAnima.interval = anima.interval;
                imgAnima.play();
            });
        }
        // var imgIcon = item.getChildByName('icon') as Laya.Image;
        // imgIcon.loadImage(this.morelistDatas[index].iconImg);
        // var label = item.getChildByName('namelab') as Laya.Label;
        // label.text = this.morelistDatas[index].title;
        this.checkSendExpsureLog(index);
        // }
    };
    YouziMoreGame.prototype.checkSendExpsureLog = function (index) {
        if (this.visible && this.MoreGameUI.visible) {
            if (!this.mainItemExposure[this.morelistDatas[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData_1.YouziData.sendExposureLog(this.morelistDatas[index], YouziData_1.BI_PAGE_TYPE.MORE);
                this.mainItemExposure[this.morelistDatas[index].appid] = 1;
            }
        }
    };
    YouziMoreGame.prototype.stopMoreGameAcion = function () {
        this.stopAction = true;
    };
    YouziMoreGame.prototype.starMoreGameAction = function () {
        this.moreGameListAutoScroll();
    };
    YouziMoreGame.prototype.moreGameListAutoScroll = function () {
        if (!this.MoreGameUI.visible)
            return;
        if (this.morelistDatas.length <= 12) {
            return;
        }
        this.stopAction = false;
        //当前是从前面开始向后，但是未到后面
        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        }
        else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }
    };
    YouziMoreGame.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.moreGameList.tweenTo(this.morelistDatas.length - 1, this.dur, endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    };
    YouziMoreGame.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.moreGameList.tweenTo(0, this.dur, startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    };
    YouziMoreGame.prototype.moreGameListMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
            // if(type == 1 || type ==2){
            //     this.mouseClickChange = true;
            // }
        }
        else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的更多游戏索引：" + index);
                var tmpData = this.morelistDatas[index];
                tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.MORE;
                YouziData_1.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime);
            }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziMoreGame.prototype.startOtherCall = function () {
        this.isClick = false;
        this.starMoreGameAction();
    };
    YouziMoreGame.prototype.checkExposure = function () {
        if (this.MoreGameUI.visible) {
            for (var i = 0; i < this.morelistDatas.length; i++) {
                var infoData = this.morelistDatas[i];
                if (!this.mainItemExposure[infoData.appid]) {
                    this.mainItemExposure[infoData.appid] = 1;
                    YouziData_1.YouziData.sendExposureLog(infoData, YouziData_1.BI_PAGE_TYPE.MORE);
                }
                if (i >= 11) {
                    break;
                }
            }
        }
    };
    return YouziMoreGame;
}(layaMaxUI_1.ui.youzi.Youzi_MoreGameUI));
exports["default"] = YouziMoreGame;
