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
var YouziOffLineH = /** @class */ (function (_super) {
    __extends(YouziOffLineH, _super);
    function YouziOffLineH() {
        var _this = _super.call(this) || this;
        _this.offLineGameShow = [];
        _this.offLineGameDatas = [];
        _this.offLineCreateComplete = false;
        _this.isSendLog = true;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        //获取毫秒
        _this.hideOffLineGameTimes = 0;
        if (Laya.stage.width / Laya.stage.height >= 1.9) {
            _this.OffLineUI.pos(Laya.stage.width / 2 - _this.OffLineUI.width / 2, Laya.stage.height / 2 - _this.OffLineUI.height / 2);
        }
        else {
            _this.centerX = 0;
            _this.centerY = 0;
        }
        _this.visible = false;
        _this.OffLineUI.visible = false;
        return _this;
    }
    YouziOffLineH.prototype.setYouziPosition = function (x, y) {
        this.centerX = NaN;
        this.centerY = NaN;
        this.OffLineUI.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziOffLineH.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziOffLineH.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziOffLineH.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziOffLineH.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziOffLineH.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziOffLineH.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziOffLineH.prototype.onEnable = function () {
        var offLineDataOk = YouziData_1.YouziData._isDataLoaded;
        if (offLineDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziOffLineH.prototype.initShow = function () {
        this.offLineGameDatas = YouziData_1.YouziData.offlineBannerDatas;
        this.wxOnShow();
        this.wxOnHide();
        //以下demo演示用
        // this.createOffLineDialog(); 
        // this.visible = true;
        // this.OffLineUI.visible = true;
    };
    YouziOffLineH.prototype.wxOnShow = function () {
        var self = this;
        if (Laya.Browser.window.wx) {
            Laya.Browser.window.wx.onShow(function (res) {
                var showOffLineTimes = Math.floor(new Date().getTime() - self.hideOffLineGameTimes);
                var showOffLineTimeSecond = Math.floor(showOffLineTimes / 1000);
                // console.log('showOffLineTimes :'+showOffLineTimeSecond);
                if (showOffLineTimeSecond >= 8) {
                    // console.log("offLineCreateComplete :"+self.offLineCreateComplete);
                    if (self.offLineCreateComplete) {
                        self.visible = true;
                        self.OffLineUI.visible = true;
                        self.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_OffLineH, { uiVisible: true });
                        // console.log('offlineshow');
                        if (self.isSendLog) {
                            for (var i = 0; i < self.offLineGameShow.length; i++) {
                                YouziData_1.YouziData.sendExposureLog(self.offLineGameShow[i], YouziData_1.BI_PAGE_TYPE.OFFLINE);
                                if (i == self.offLineGameShow.length) {
                                    self.isSendLog = false;
                                }
                            }
                        }
                    }
                }
            });
        }
    };
    YouziOffLineH.prototype.wxOnHide = function () {
        var self = this;
        if (Laya.Browser.window.wx) {
            Laya.Browser.window.wx.onHide(function () {
                self.hideOffLineGameTimes = new Date().getTime();
                if (self.offLineGameDatas.length > 0 && !self.offLineCreateComplete) {
                    self.createOffLineDialog();
                }
            });
        }
    };
    YouziOffLineH.prototype.createOffLineDialog = function () {
        if (this.offLineGameDatas.length <= 0) {
            console.log('离线推荐没有数据');
            return;
        }
        this.OffLineCloseButton.on(Laya.Event.CLICK, this, this.onBtnOffLineClose);
        var offLineArr = [];
        for (var i = 0; i < this.offLineGameDatas.length; i++) {
            if (i >= 3) {
                break;
            }
            else {
                var tempOffLine = this.offLineGameDatas[i];
                offLineArr.push({ infoData: tempOffLine, namelab: tempOffLine.title });
            }
        }
        //设定list 位置，以这种方式解决list中item的居中问题
        var offLineListPostionX = 0;
        switch (offLineArr.length) {
            case 1:
                offLineListPostionX = 205;
                break;
            case 2:
                offLineListPostionX = 85;
                this.OffLineList.spaceX = 50;
                break;
            default:
                offLineListPostionX = 8;
                this.OffLineList.spaceX = 15;
                break;
        }
        this.OffLineList.x = offLineListPostionX;
        this.OffLineList.mouseHandler = new Laya.Handler(this, this.onOffLinelistItemMouseEvent);
        this.OffLineList.dataSource = offLineArr;
        for (var j = 0; j < this.offLineGameDatas.length; j++) {
            if (this.offLineGameDatas[j].dynamicType == 1 && this.offLineGameDatas[j].dynamicIcon) {
                var imgAnima = this.OffLineList.getCell(j).getChildByName('iconAnima');
                imgAnima.scale(1.16, 1.16);
                var youziAnima = new YouziAtlasPngAnima_1["default"]();
                youziAnima.createAnimation(this.offLineGameDatas[j].dynamicIcon, 
                // imgAnima,
                function (anima) {
                    imgAnima.frames = anima.frames;
                    imgAnima.interval = anima.interval;
                    imgAnima.visible = true;
                    imgAnima.play();
                });
            }
            else {
                var offLineIcon = this.OffLineList.getCell(j).getChildByName('icon');
                offLineIcon.loadImage(this.offLineGameDatas[j].iconImg);
            }
            if (this.offLineGameDatas[j].hotred == 1) {
                var offLineIconRedHit = this.OffLineList.getCell(j).getChildByName('redhit');
                offLineIconRedHit.visible = true;
            }
            this.offLineGameShow.push(this.offLineGameDatas[j]);
            // console.log('offlinecreat '+j);
            if (++j >= offLineArr.length) {
                // console.log('offlinecreat finish');
                this.offLineCreateComplete = true;
                break;
            }
        }
        this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_OffLineH, { complete: true });
    };
    YouziOffLineH.prototype.onBtnOffLineClose = function () {
        this.visible = false;
        this.OffLineUI.visible = false;
        this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_OffLineH, { uiVisible: false });
    };
    YouziOffLineH.prototype.onOffLinelistItemMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            console.log("当前选择的hotlist索引：" + index);
            var tmpData = this.offLineGameDatas[index];
            tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.OFFLINE;
            tmpData.type = 3;
            if (tmpData.hotred == 1) {
                var hideOffLineHit = this.OffLineList.getCell(index).getChildByName('icon').getChildByName('redhit');
                hideOffLineHit.visible = false;
            }
            YouziData_1.YouziData.startOtherGame(tmpData, null);
        }
        else if (e.type == 'mouseover') {
        }
        else if (e.type == 'mouseout') {
        }
    };
    return YouziOffLineH;
}(layaMaxUI_1.ui.youzi.Youzi_OffLineHUI));
exports["default"] = YouziOffLineH;
