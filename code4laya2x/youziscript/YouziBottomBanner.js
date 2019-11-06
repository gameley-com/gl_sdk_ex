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
/**
 * 底部猜你喜欢
 */
var YouziBottomBanner = /** @class */ (function (_super) {
    __extends(YouziBottomBanner, _super);
    function YouziBottomBanner(isOffSwitch) {
        var _this = _super.call(this) || this;
        _this.matrixBannerDatas = [];
        _this.bannerType = YouziData_1.BANNER_TYPE.MATRIX;
        _this.bannerBottomItemExposure = {};
        //false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
        _this.isOffSwitch = false;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.stopAction = false;
        _this.curFront = true;
        _this.curBack = false;
        _this.isClick = false;
        _this.dur = 10;
        _this.pos(Laya.stage.width / 2 - _this.BannerBottomUI.width / 2, Laya.stage.height - _this.BannerBottomUI.height);
        _this.visible = false;
        _this.BannerBottomUI.visible = false;
        _this.bottomList.scrollBar.hide = true;
        _this.isOffSwitch = isOffSwitch;
        return _this;
    }
    YouziBottomBanner.prototype.setYouziPosition = function (x, y) {
        this.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziBottomBanner.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziBottomBanner.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziBottomBanner.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziBottomBanner.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziBottomBanner.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziBottomBanner.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziBottomBanner.prototype.onEnable = function () {
        var isBottomDataOk = YouziData_1.YouziData._isDataLoaded;
        if (isBottomDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziBottomBanner.prototype.initShow = function () {
        this.matrixBannerDatas = YouziData_1.YouziData.matrixBannerDatas;
        if (this.matrixBannerDatas.length <= 0) {
            return;
        }
        this.loadBottomList();
        if (!this.isOffSwitch) {
            YouziData_1.YouziData.addBanner(this);
        }
    };
    YouziBottomBanner.prototype.loadBottomList = function () {
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
        this.bottomList.array = arr;
        this.bottomList.renderHandler = new Laya.Handler(this, this.onListRender);
        this.bottomList.mouseHandler = new Laya.Handler(this, this.onBannerItemMouseEvent);
        this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_BottomBanner, { complete: true });
        this.dur = this.matrixBannerDatas.length ? (this.matrixBannerDatas.length - 5) * 5000 : 5000;
        this.bottomlistAutoScroll();
    };
    YouziBottomBanner.prototype.onListRender = function (item, index) {
        // console.log('------->render bottombanner : ',index);
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.matrixBannerDatas[index].iconImg);
        if (this.matrixBannerDatas[index].dynamicType == 1 && this.matrixBannerDatas[index].dynamicIcon) {
            var imgAnima = item.getChildByName('iconAnima');
            imgAnima.scale(0.91, 0.91);
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
    YouziBottomBanner.prototype.checkSendExpsureLog = function (index) {
        if (this.visible && this.BannerBottomUI.visible) {
            if (!this.bannerBottomItemExposure[this.matrixBannerDatas[index].appid]) {
                // console.log('---send log index:',index);
                YouziData_1.YouziData.sendExposureLog(this.matrixBannerDatas[index], YouziData_1.BI_PAGE_TYPE.MATRIX);
                this.bannerBottomItemExposure[this.matrixBannerDatas[index].appid] = 1;
            }
        }
    };
    YouziBottomBanner.prototype.onBannerItemMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            if (!this.isClick) {
                this.isClick = true;
                console.log("当前选择的bottombanner索引：" + index);
                YouziData_1.YouziData.clickGameYouziUIId = YouziData_1.YOUZI_UI_ID.Youzi_BottomBanner;
                var tmpData = this.matrixBannerDatas[index];
                tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.MATRIX;
                YouziData_1.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime)
            }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziBottomBanner.prototype.startOtherCall = function (state) {
        this.isClick = false;
        this.starBottomBannerAction();
    };
    YouziBottomBanner.prototype.stopBottomBannerAcion = function () {
        this.stopAction = true;
    };
    YouziBottomBanner.prototype.starBottomBannerAction = function () {
        this.bottomlistAutoScroll();
    };
    YouziBottomBanner.prototype.bottomlistAutoScroll = function () {
        if (this.matrixBannerDatas.length <= 5) {
            return;
        }
        this.stopAction = false;
        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        }
        else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }
    };
    YouziBottomBanner.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.bottomList.tweenTo(this.matrixBannerDatas.length - 1, this.dur, endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    };
    YouziBottomBanner.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.bottomList.tweenTo(0, this.dur, startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    };
    YouziBottomBanner.prototype.showBanner = function () {
        if (this) {
            this.visible = true;
            this.BannerBottomUI.visible = true;
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_BottomBanner, { uiVisible: true });
            if (this.stopAction) {
                this.starBottomBannerAction();
            }
        }
    };
    YouziBottomBanner.prototype.hideBanner = function () {
        if (this) {
            this.stopBottomBannerAcion();
            this.visible = false;
            this.BannerBottomUI.visible = false;
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_BottomBanner, { uiVisible: false });
        }
    };
    YouziBottomBanner.prototype.destroySelf = function () {
        if (this) {
            this.removeSelf();
        }
    };
    return YouziBottomBanner;
}(layaMaxUI_1.ui.youzi.Youzi_BottomBannerUI));
exports["default"] = YouziBottomBanner;
