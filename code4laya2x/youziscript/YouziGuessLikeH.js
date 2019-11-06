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
var YouziGuessLikeH = /** @class */ (function (_super) {
    __extends(YouziGuessLikeH, _super);
    function YouziGuessLikeH() {
        var _this = _super.call(this) || this;
        _this.matrixBannerDatas = [];
        _this.guessAnyItemExposure = {};
        _this.firstShow = false;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.curFront = true;
        _this.curBack = false;
        _this.stopAction = false;
        _this.isClick = false;
        _this.dur = 5000;
        _this.visible = false;
        _this.guessUI.visible = false;
        _this.guesslist.scrollBar.hide = true;
        return _this;
    }
    YouziGuessLikeH.prototype.setYouziPosition = function (x, y) {
        this.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziGuessLikeH.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziGuessLikeH.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziGuessLikeH.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziGuessLikeH.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziGuessLikeH.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziGuessLikeH.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziGuessLikeH.prototype.onEnable = function () {
        var guessLikeDataOk = YouziData_1.YouziData._isDataLoaded;
        if (guessLikeDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    // showGuessLikeView(){
    //     if(!this.firstShow){
    //         this.firstShow = true;
    //         this.checkExposure();
    //     }
    //     this.visible = true;
    //     this.guessUI.visible = true;
    //     this.guessAnylistAutoScroll();
    // }
    // hideGuessLikeView(){
    //     this.visible = false;
    //     this.guessUI.visible = false; 
    // }
    YouziGuessLikeH.prototype.initShow = function () {
        this.matrixBannerDatas = YouziData_1.YouziData.matrixBannerDatas;
        var arr = [];
        var pRecord = null;
        for (var i = 0; i < this.matrixBannerDatas.length; i++) {
            pRecord = this.matrixBannerDatas[i];
            if (pRecord.dynamicType == 1 && pRecord.dynamicIcon) {
                arr.push({ icon: "", namelab: pRecord.title });
            }
            else {
                arr.push({ icon: pRecord.iconImg, namelab: pRecord.title });
            }
        }
        this.guesslist.array = arr;
        this.guesslist.renderHandler = new Laya.Handler(this, this.onListRender);
        this.guesslist.mouseHandler = new Laya.Handler(this, this.onGuessLikeItemMouseEvent);
        this.visible = true;
        this.guessUI.visible = true;
        this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_GuessLikeH, { complete: true });
        this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_GuessLikeH, { uiVisible: true });
        this.dur = this.matrixBannerDatas.length > 5 ? (this.matrixBannerDatas.length - 5) * 5000 : 5000;
        this.guessAnylistHAutoScroll();
    };
    YouziGuessLikeH.prototype.onListRender = function (item, index) {
        // console.log('------->render guesslikeh : ',index);
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.matrixBannerDatas[index].iconImg);
        if (this.matrixBannerDatas[index].dynamicType == 1 && this.matrixBannerDatas[index].dynamicIcon) {
            var imgAnima = item.getChildByName('iconAnima');
            imgAnima.scale(0.75, 0.75);
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima_1["default"]();
            youziAnima.createAnimation(this.matrixBannerDatas[index].dynamicIcon, 
            // imgAnima,
            function (anima) {
                imgAnima.frames = anima.frames;
                imgAnima.interval = anima.interval;
                imgAnima.play();
            });
        }
        this.checkSendExpsureLog(index);
    };
    YouziGuessLikeH.prototype.checkSendExpsureLog = function (index) {
        if (this.visible && this.guessUI.visible) {
            if (!this.guessAnyItemExposure[this.matrixBannerDatas[index].appid]) {
                // console.log('---send log index:',index);
                YouziData_1.YouziData.sendExposureLog(this.matrixBannerDatas[index], YouziData_1.BI_PAGE_TYPE.GUESS);
                this.guessAnyItemExposure[this.matrixBannerDatas[index].appid] = 1;
            }
        }
    };
    YouziGuessLikeH.prototype.stopGuessLikeHAcion = function () {
        this.stopAction = true;
    };
    YouziGuessLikeH.prototype.starGuessLikeHAction = function () {
        this.guessAnylistHAutoScroll();
    };
    YouziGuessLikeH.prototype.guessAnylistHAutoScroll = function () {
        if (!this.guessUI.visible)
            return;
        if (this.matrixBannerDatas.length <= 5) {
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
    YouziGuessLikeH.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            this.curFront = true;
            this.curBack = false;
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.guesslist.tweenTo(this.matrixBannerDatas.length - 1, this.dur, endCompletHandler);
        }
    };
    YouziGuessLikeH.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            this.curFront = false;
            this.curBack = true;
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.guesslist.tweenTo(0, this.dur, startCompleteHandler);
        }
    };
    YouziGuessLikeH.prototype.onGuessLikeItemMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的guesslikeh索引：" + index);
                YouziData_1.YouziData.clickGameYouziUIId = YouziData_1.YOUZI_UI_ID.Youzi_GuessLikeH;
                var tmpData = this.matrixBannerDatas[index];
                tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.GUESS;
                YouziData_1.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
            }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziGuessLikeH.prototype.startOtherCall = function (state) {
        this.isClick = false;
        this.starGuessLikeHAction();
    };
    return YouziGuessLikeH;
}(layaMaxUI_1.ui.youzi.Youzi_GuessLikeHUI));
exports["default"] = YouziGuessLikeH;
