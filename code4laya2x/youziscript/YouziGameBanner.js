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
/**
 * 底部游戏banner推荐，类似于微信banner广告
 */
var YouziGameBanner = /** @class */ (function (_super) {
    __extends(YouziGameBanner, _super);
    function YouziGameBanner(isOffSwitch, switchTime) {
        var _this = _super.call(this) || this;
        _this.isOffSwitch = false;
        _this.bannerType = YouziData_1.BANNER_TYPE.GAME;
        _this.switchTime = 5;
        _this.gameBannerItemExposure = {};
        _this.startSwitchIndex = 0;
        _this.isHide = false;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.pos(Laya.stage.width / 2 - _this.GameBannerList.width / 2, Laya.stage.height - _this.GameBannerList.height);
        _this.visible = false;
        _this.GameBannerList.scrollBar.hide = true;
        _this.isOffSwitch = isOffSwitch;
        _this.switchTime = switchTime < 5 ? 5 : switchTime;
        _this.switchTime *= 1000;
        return _this;
    }
    YouziGameBanner.prototype.setYouziPosition = function (x, y) {
        this.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziGameBanner.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziGameBanner.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziGameBanner.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziGameBanner.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziGameBanner.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziGameBanner.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziGameBanner.prototype.onEnable = function () {
        var gameBannerDatasOk = YouziData_1.YouziData._isDataLoaded;
        if (gameBannerDatasOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziGameBanner.prototype.initShow = function () {
        if (YouziData_1.YouziData.gameBannerDatas.length <= 0)
            return;
        this.loadGameBannerList();
        this.creatGameBannerTimerLoop();
        if (!this.isOffSwitch) {
            YouziData_1.YouziData.addBanner(this);
        }
    };
    YouziGameBanner.prototype.loadGameBannerList = function () {
        this.GameBannerList.repeatX = YouziData_1.YouziData.gameBannerDatas.length;
        var gameBannerArr = [];
        for (var gameBannerArrI = 0; gameBannerArrI < YouziData_1.YouziData.gameBannerDatas.length; gameBannerArrI++) {
            gameBannerArr.push({ infoData: YouziData_1.YouziData.gameBannerDatas[gameBannerArrI] });
        }
        this.GameBannerList.mouseHandler = new Laya.Handler(this, this.onGameBannerItemMouseEvent);
        this.GameBannerList.dataSource = gameBannerArr;
        for (var gameBannerDataI = 0; gameBannerArrI < YouziData_1.YouziData.gameBannerDatas.length; gameBannerDataI++) {
            var gameBannerImage = this.GameBannerList.getCell(gameBannerDataI).getChildByName('icon');
            gameBannerImage.loadImage(YouziData_1.YouziData.gameBannerDatas[gameBannerDataI].bannerImg);
        }
        this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_GameBanner, { complete: true });
    };
    YouziGameBanner.prototype.creatGameBannerTimerLoop = function () {
        Laya.timer.loop(this.switchTime, this, this.updateGameBaner);
    };
    YouziGameBanner.prototype.clearGameBannerTimerLoop = function () {
        Laya.timer.clear(this, this.updateGameBaner);
    };
    YouziGameBanner.prototype.updateGameBaner = function (e) {
        if (YouziData_1.YouziData.gameBannerDatas.length <= 1) {
            this.checkExposure();
            return;
        }
        else {
            this.startSwitchIndex = this.GameBannerList.startIndex + 1;
            this.GameBannerList.scrollTo(this.startSwitchIndex >= this.GameBannerList.length ? 0 : this.startSwitchIndex);
            this.checkExposure();
        }
    };
    YouziGameBanner.prototype.checkExposure = function () {
        if (this.visible) {
            var data = YouziData_1.YouziData.gameBannerDatas[this.startSwitchIndex];
            if (!this.gameBannerItemExposure[data.appid]) {
                this.gameBannerItemExposure[data.appid] = 1;
                YouziData_1.YouziData.sendExposureLog(data, YouziData_1.BI_PAGE_TYPE.GAME);
            }
        }
    };
    YouziGameBanner.prototype.onGameBannerItemMouseEvent = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            console.log("当前选择的gamebannerlist索引：" + index);
            var tmpData = YouziData_1.YouziData.gameBannerDatas[index];
            tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.GAME;
            tmpData.type = 5;
            YouziData_1.YouziData.startOtherGame(tmpData, null);
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziGameBanner.prototype.showBanner = function () {
        if (this) {
            this.visible = true;
            if (this.isHide) {
                this.isHide = false;
                this.creatGameBannerTimerLoop();
            }
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_GameBanner, { uiVisible: true });
        }
    };
    YouziGameBanner.prototype.hideBanner = function () {
        if (this) {
            this.isHide = true;
            this.visible = false;
            this.clearGameBannerTimerLoop();
            this.notifyUIState(YouziData_1.YOUZI_UI_ID.Youzi_GameBanner, { uiVisible: false });
        }
    };
    YouziGameBanner.prototype.destroySelf = function () {
        if (this) {
            this.removeSelf();
        }
    };
    return YouziGameBanner;
}(layaMaxUI_1.ui.youzi.Youzi_GameBannerViewUI));
exports["default"] = YouziGameBanner;
