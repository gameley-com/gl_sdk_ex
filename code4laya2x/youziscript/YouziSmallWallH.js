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
var YouziSmallWallH = /** @class */ (function (_super) {
    __extends(YouziSmallWallH, _super);
    function YouziSmallWallH() {
        var _this = _super.call(this) || this;
        _this.smallWallHDatas = [];
        _this.smallWallHItemExposure = {};
        _this.smallWallHItemExposureCount = 0;
        _this.uiCompleteCallCopy = null;
        // private uiStateCallCopy:Function = null;
        _this.curFront = true;
        _this.curBack = false;
        _this.stopAction = false;
        _this.isClick = false;
        _this.dur = 5000;
        _this.visible = false;
        _this.SmallWallUIH.visible = false;
        _this.smallWallListH.scrollBar.hide = true;
        return _this;
    }
    YouziSmallWallH.prototype.setYouziPosition = function (x, y) {
        this.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziSmallWallH.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziSmallWallH.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziSmallWallH.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziSmallWallH.prototype.onEnable = function () {
        var isSmallWallDataOk = YouziData_1.YouziData._isDataLoaded;
        if (isSmallWallDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziSmallWallH.prototype.initShow = function () {
        this.smallWallHDatas = YouziData_1.YouziData.moreDatas;
        if (this.smallWallHDatas.length > 0) {
            var arr = [];
            var pRecord = null;
            for (var i = 0; i < this.smallWallHDatas.length; i++) {
                pRecord = this.smallWallHDatas[i];
                if (pRecord.dynamicType == 1 && pRecord.dynamicIcon) {
                    arr.push({ icon: "", namelab: pRecord.title });
                }
                else {
                    arr.push({ icon: pRecord.iconImg, namelab: pRecord.title });
                }
            }
            this.smallWallListH.renderHandler = new Laya.Handler(this, this.onListRender);
            this.smallWallListH.array = arr;
            this.smallWallListH.mouseHandler = new Laya.Handler(this, this.onSmallWallListItemMouseEvent);
            this.visible = true;
            this.SmallWallUIH.visible = true;
            this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_SmallWall, { complete: true });
            this.dur = this.smallWallHDatas.length > 8 ? (this.smallWallHDatas.length - 8) * 5000 : 5000;
            this.starSmallWallAction();
        }
    };
    YouziSmallWallH.prototype.onListRender = function (cell, index) {
        // console.log('small index : ',index);
        if (this.smallWallHDatas[index].hotred == 1) {
            var redHitWallH = cell.getChildByName('redhit');
            redHitWallH.visible = true;
        }
        if (this.smallWallHDatas[index].dynamicType == 1 && this.smallWallHDatas[index].dynamicIcon) {
            var imgAnima = cell.getChildByName('iconAnima');
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima_1["default"]();
            youziAnima.createAnimation(this.smallWallHDatas[index].dynamicIcon, 
            // imgAnima,
            function (anima) {
                imgAnima.frames = anima.frames;
                imgAnima.interval = anima.interval;
                imgAnima.play();
            });
        }
        this.checkSendExpsureLog(index);
    };
    YouziSmallWallH.prototype.checkSendExpsureLog = function (index) {
        if (this.visible && this.SmallWallUIH.visible) {
            if (!this.smallWallHItemExposure[this.smallWallHDatas[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData_1.YouziData.sendExposureLog(this.smallWallHDatas[index], YouziData_1.BI_PAGE_TYPE.SMALL_MATRIX_WALL);
                this.smallWallHItemExposure[this.smallWallHDatas[index].appid] = 1;
            }
        }
    };
    YouziSmallWallH.prototype.stopSmallWallAcion = function () {
        this.stopAction = true;
    };
    YouziSmallWallH.prototype.starSmallWallAction = function () {
        this.smallWallListAutoScroll();
    };
    YouziSmallWallH.prototype.smallWallListAutoScroll = function () {
        if (!this.SmallWallUIH.visible)
            return;
        if (this.smallWallHDatas.length <= 8) {
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
    YouziSmallWallH.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.smallWallListH.tweenTo(this.smallWallHDatas.length - 1, this.dur, endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    };
    YouziSmallWallH.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.smallWallListH.tweenTo(0, this.dur, startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    };
    YouziSmallWallH.prototype.onSmallWallListItemMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的大家都在玩儿索引：" + index);
                var tmpData = this.smallWallHDatas[index];
                tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.SMALL_MATRIX_WALL;
                YouziData_1.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                if (tmpData.hotred == 1) {
                    var tmpSlideHit = this.smallWallListH.getCell(index).getChildByName('redhit');
                    tmpSlideHit.visible = false;
                }
            }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziSmallWallH.prototype.startOtherCall = function (state) {
        this.isClick = false;
        this.starSmallWallAction();
    };
    return YouziSmallWallH;
}(layaMaxUI_1.ui.youzi.Youzi_SmallWallHUI));
exports["default"] = YouziSmallWallH;
