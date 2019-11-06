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
var YouziMoreGameH = /** @class */ (function (_super) {
    __extends(YouziMoreGameH, _super);
    function YouziMoreGameH() {
        var _this = _super.call(this) || this;
        _this.morelistHDatas = [];
        _this.mainItemHExposure = {};
        _this.fisrtShow = false;
        _this.isCreate = false;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.curFront = true;
        _this.curBack = false;
        _this.stopAction = false;
        _this.isClick = false;
        _this.dur = 5000;
        if (Laya.stage.width / Laya.stage.height >= 1.9) {
            _this.MoreGameUI.scale(0.9, 0.9);
            var scaleW = _this.MoreGameUI.width * 0.9;
            var scaleH = _this.MoreGameUI.height * 0.9;
            _this.MoreGameUI.pos(Laya.stage.width / 2 - scaleW / 2, Laya.stage.height / 2 - scaleH / 2);
        }
        else {
            _this.centerX = 0;
            _this.centerY = 0;
        }
        _this.visible = false;
        _this.MoreGameUI.visible = false;
        _this.moreGameList.scrollBar.hide = true;
        return _this;
    }
    YouziMoreGameH.prototype.setYouziPosition = function (x, y) {
        this.centerX = NaN;
        this.centerY = NaN;
        this.MoreGameUI.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziMoreGameH.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMoreGameH.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziMoreGameH.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziMoreGameH.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMoreGameH.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziMoreGameH.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziMoreGameH.prototype.onEnable = function () {
        var isMoreGameOk = YouziData_1.YouziData._isDataLoaded;
        if (isMoreGameOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziMoreGameH.prototype.showMoreGameUI = function () {
        if (this.isCreate && !this.visible) {
            this.visible = true;
            this.moreGameList.mouseThrough = false;
            this.MoreGameUI.visible = true;
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_MoreGameH, { uiVisible: true });
            this.starMoreGameAction();
            if (!this.fisrtShow) {
                this.fisrtShow = true;
                this.checkExposure();
            }
        }
    };
    YouziMoreGameH.prototype.onBtnCloseClicked = function () {
        this.stopMoreGameAcion();
        this.visible = false;
        this.moreGameList.mouseThrough = true;
        this.MoreGameUI.visible = false;
        this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_MoreGameH, { uiVisible: false });
    };
    YouziMoreGameH.prototype.initShow = function () {
        this.moreGameCloseBtn.on(Laya.Event.CLICK, this, this.onBtnCloseClicked);
        if (YouziData_1.YouziData.moreDatas.length > 0) {
            this.morelistHDatas = YouziData_1.YouziData.moreDatas;
            var arr = [];
            var pRecord = null;
            for (var i = 0; i < this.morelistHDatas.length; i++) {
                pRecord = this.morelistHDatas[i];
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
            this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_MoreGameH, { complete: true });
            this.dur = this.morelistHDatas.length > 12 ? (this.morelistHDatas.length - 12) * 5000 : 5000;
        }
    };
    YouziMoreGameH.prototype.onListRender = function (item, index) {
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.morelistDatas[index].iconImg);
        if (this.morelistHDatas[index].dynamicType == 1 && this.morelistHDatas[index].dynamicIcon) {
            var imgAnima = item.getChildByName('iconAnima');
            imgAnima.scale(1.16, 1.16);
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima_1["default"]();
            youziAnima.createAnimation(this.morelistHDatas[index].dynamicIcon, 
            // imgAnima,
            function (anima) {
                imgAnima.frames = anima.frames;
                imgAnima.interval = anima.interval;
                imgAnima.play();
            });
        }
        this.checkSendExpsureLog(index);
    };
    YouziMoreGameH.prototype.checkSendExpsureLog = function (index) {
        if (this.visible && this.MoreGameUI.visible) {
            if (!this.mainItemHExposure[this.morelistHDatas[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData_1.YouziData.sendExposureLog(this.morelistHDatas[index], YouziData_1.BI_PAGE_TYPE.MORE);
                this.mainItemHExposure[this.morelistHDatas[index].appid] = 1;
            }
        }
    };
    YouziMoreGameH.prototype.stopMoreGameAcion = function () {
        this.stopAction = true;
    };
    YouziMoreGameH.prototype.starMoreGameAction = function () {
        this.moreGameListAutoScroll();
    };
    YouziMoreGameH.prototype.moreGameListAutoScroll = function () {
        if (!this.MoreGameUI.visible)
            return;
        if (this.morelistHDatas.length <= 12) {
            return;
        }
        this.stopAction = false;
        this.dur = (this.morelistHDatas.length - 12) * 5000;
        //当前是从前面开始向后，但是未到后面
        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        }
        else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }
    };
    YouziMoreGameH.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.moreGameList.tweenTo(this.morelistHDatas.length - 1, this.dur, endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    };
    YouziMoreGameH.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.moreGameList.tweenTo(0, this.dur, startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    };
    YouziMoreGameH.prototype.moreGameListMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的moreGameH索引：" + index);
                var tmpData = this.morelistHDatas[index];
                tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.MORE;
                YouziData_1.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime); 
            }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziMoreGameH.prototype.startOtherCall = function () {
        this.isClick = false;
        this.starMoreGameAction();
    };
    YouziMoreGameH.prototype.checkExposure = function () {
        if (this.MoreGameUI.visible) {
            for (var i = 0; i < this.morelistHDatas.length; i++) {
                var infoData = this.morelistHDatas[i];
                if (!this.mainItemHExposure[infoData.appid]) {
                    this.mainItemHExposure[infoData.appid] = 1;
                    YouziData_1.YouziData.sendExposureLog(infoData, YouziData_1.BI_PAGE_TYPE.MORE);
                }
                if (i >= 11) {
                    break;
                }
            }
        }
    };
    return YouziMoreGameH;
}(layaMaxUI_1.ui.youzi.Youzi_MoreGameHUI));
exports["default"] = YouziMoreGameH;
