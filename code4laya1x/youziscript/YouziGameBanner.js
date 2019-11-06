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
var YouziGameBanner_Module;
(function (YouziGameBanner_Module) {
    var YouziGameBanner = /** @class */ (function (_super) {
        __extends(YouziGameBanner, _super);
        function YouziGameBanner(isOffSwitch, switchTime) {
            var _this = _super.call(this) || this;
            _this.isOffSwitch = false;
            _this.bannerType = YouziDataModule.BANNER_TYPE.GAME;
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
        YouziGameBanner.prototype.onMyStart = function () {
            var gameBannerDatasOk = YouziDataModule.YouziData._isDataLoaded;
            if (gameBannerDatasOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziGameBanner.prototype.initShow = function () {
            if (YouziDataModule.YouziData.gameBannerDatas.length <= 0)
                return;
            this.loadGameBannerList();
            this.startGameBannerTimerLoop();
            if (!this.isOffSwitch) {
                YouziDataModule.YouziData.addBanner(this);
            }
        };
        YouziGameBanner.prototype.loadGameBannerList = function () {
            var gameBannerArr = [];
            for (var i = 0; i < YouziDataModule.YouziData.gameBannerDatas.length; i++) {
                gameBannerArr.push({ infoData: YouziDataModule.YouziData.gameBannerDatas[i] });
            }
            this.GameBannerList.array = gameBannerArr;
            this.GameBannerList.renderHandler = new Handler(this, this.onListRender);
            this.GameBannerList.mouseHandler = new Handler(this, this.onGameBannerItemMouseEvent);
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner, { complete: true });
        };
        YouziGameBanner.prototype.onListRender = function (item, index) {
            // console.log('------->render gamebanner : ',index);
            var gameBannerImage = item.getChildByName('icon');
            gameBannerImage.loadImage(YouziDataModule.YouziData.gameBannerDatas[index].bannerImg);
        };
        YouziGameBanner.prototype.startGameBannerTimerLoop = function () {
            if (this && this.visible)
                Laya.timer.loop(this.switchTime, this, this.updateGameBaner);
        };
        YouziGameBanner.prototype.clearGameBannerTimerLoop = function () {
            if (this)
                Laya.timer.clear(this, this.updateGameBaner);
        };
        YouziGameBanner.prototype.updateGameBaner = function (e) {
            if (YouziDataModule.YouziData.gameBannerDatas.length <= 1) {
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
                var data = YouziDataModule.YouziData.gameBannerDatas[this.startSwitchIndex];
                if (!this.gameBannerItemExposure[data.appid]) {
                    this.gameBannerItemExposure[data.appid] = 1;
                    YouziDataModule.YouziData.sendExposureLog(data, YouziDataModule.BI_PAGE_TYPE.GAME);
                }
            }
        };
        YouziGameBanner.prototype.onGameBannerItemMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                console.log("当前选择的gamebannerlist索引：" + index);
                var tmpData = YouziDataModule.YouziData.gameBannerDatas[index];
                tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.GAME;
                YouziDataModule.YouziData.startOtherGame(tmpData, null);
            }
            else if (e.type == 'mouseover') {
            }
        };
        YouziGameBanner.prototype.showBanner = function () {
            if (this) {
                this.visible = true;
                if (this.isHide) {
                    this.isHide = false;
                    this.startGameBannerTimerLoop();
                }
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner, { uiVisible: true });
            }
        };
        YouziGameBanner.prototype.hideBanner = function () {
            if (this) {
                this.isHide = true;
                this.visible = false;
                this.clearGameBannerTimerLoop();
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GameBanner, { uiVisible: false });
            }
        };
        YouziGameBanner.prototype.destroySelf = function () {
            if (this) {
                this.removeSelf();
            }
        };
        return YouziGameBanner;
    }(ui.youzi.Youzi_GameBannerUI));
    YouziGameBanner_Module.YouziGameBanner = YouziGameBanner;
})(YouziGameBanner_Module || (YouziGameBanner_Module = {}));
