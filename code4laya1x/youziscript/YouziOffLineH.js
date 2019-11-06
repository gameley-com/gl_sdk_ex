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
var YouziOffLineH_Module;
(function (YouziOffLineH_Module) {
    var YouziOffLineH = /** @class */ (function (_super) {
        __extends(YouziOffLineH, _super);
        function YouziOffLineH() {
            var _this = _super.call(this) || this;
            _this.offLineGameShow = [];
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
        YouziOffLineH.prototype.onMyStart = function () {
            var offLineDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (offLineDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziOffLineH.prototype.initShow = function () {
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
                    if (showOffLineTimeSecond >= 8) {
                        if (self.offLineCreateComplete) {
                            self.visible = true;
                            self.OffLineUI.visible = true;
                            self.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine, { uiVisible: true });
                            self.checkExposure();
                        }
                    }
                });
            }
        };
        YouziOffLineH.prototype.checkExposure = function () {
            if (this.isSendLog) {
                for (var i = 0; i < this.offLineGameShow.length; i++) {
                    YouziDataModule.YouziData.sendExposureLog(this.offLineGameShow[i], YouziDataModule.BI_PAGE_TYPE.OFFLINE);
                    if (i == this.offLineGameShow.length) {
                        this.isSendLog = false;
                    }
                }
            }
        };
        YouziOffLineH.prototype.wxOnHide = function () {
            var self = this;
            if (Laya.Browser.window.wx) {
                Laya.Browser.window.wx.onHide(function () {
                    self.hideOffLineGameTimes = new Date().getTime();
                    if (YouziDataModule.YouziData.offlineBannerDatas.length > 0 && !self.offLineCreateComplete) {
                        self.createOffLineDialog();
                    }
                });
            }
        };
        YouziOffLineH.prototype.createOffLineDialog = function () {
            this.OffLineCloseButton.on(Laya.Event.CLICK, this, this.onBtnOffLineClose);
            var offLineArr = [];
            for (var i = 0; i < YouziDataModule.YouziData.offlineBannerDatas.length; i++) {
                if (i >= 3) {
                    break;
                }
                else {
                    var tempOffLine = YouziDataModule.YouziData.offlineBannerDatas[i];
                    this.offLineGameShow.push(tempOffLine);
                    offLineArr.push({ icon: tempOffLine.iconImg, namelab: tempOffLine.title });
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
            this.OffLineList.array = offLineArr;
            this.OffLineList.mouseHandler = new Handler(this, this.onOffLinelistItemMouseEvent);
            this.OffLineList.renderHandler = new Handler(this, this.onListRender);
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine, { complete: true });
            this.offLineCreateComplete = true;
        };
        YouziOffLineH.prototype.onListRender = function (item, index) {
            var redhit = item.getChildByName('icon').getChildByName('redhit');
            if (this.offLineGameShow[index].hotred == 1) {
                redhit.visible = true;
            }
            else {
                redhit.visible = false;
            }
        };
        YouziOffLineH.prototype.onBtnOffLineClose = function () {
            this.visible = false;
            this.OffLineUI.visible = false;
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine, { uiVisible: false });
        };
        YouziOffLineH.prototype.onOffLinelistItemMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                console.log("当前选择的hotlist索引：" + index);
                var tmpData = this.offLineGameShow[index];
                tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.OFFLINE;
                YouziDataModule.YouziData.startOtherGame(tmpData, null);
                if (tmpData.hotred == 1) {
                    var hideOffLineHit = this.OffLineList.getCell(index).getChildByName('icon').getChildByName('redhit');
                    hideOffLineHit.visible = false;
                }
            }
            else if (e.type == 'mouseover') {
            }
            else if (e.type == 'mouseout') {
            }
        };
        return YouziOffLineH;
    }(ui.youzi.Youzi_OffLineHUI));
    YouziOffLineH_Module.YouziOffLineH = YouziOffLineH;
})(YouziOffLineH_Module || (YouziOffLineH_Module = {}));
