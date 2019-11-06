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
var YouziOffLine_Module;
(function (YouziOffLine_Module) {
    var YouziOffLine = /** @class */ (function (_super) {
        __extends(YouziOffLine, _super);
        function YouziOffLine() {
            var _this = _super.call(this) || this;
            _this.offLineGameShow = [];
            _this.offLineCreateComplete = false;
            _this.isSendLog = true;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            //获取毫秒
            _this.hideOffLineGameTimes = 0;
            if (Laya.stage.height / Laya.stage.width >= 1.9) {
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
        YouziOffLine.prototype.setYouziPosition = function (x, y) {
            this.OffLineUI.pos(x, y);
        };
        //传入UI是否创建完成通知对象
        YouziOffLine.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziOffLine.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziOffLine.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziOffLine.prototype.setUIStateCall = function (uiStateCall) {
            this.uiStateCallCopy = uiStateCall;
        };
        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziOffLine.prototype.notifyUIState = function (uiID, msg) {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy(uiID, msg);
            }
        };
        YouziOffLine.prototype.offUIStateCall = function () {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy = null;
            }
        };
        YouziOffLine.prototype.onMyStart = function () {
            var offLineDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (offLineDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziOffLine.prototype.initShow = function () {
            this.wxOnShow();
            this.wxOnHide();
            //以下demo演示用
            // this.createOffLineDialog();
            // this.visible = true;
            // this.OffLineUI.visible = true;
        };
        YouziOffLine.prototype.wxOnShow = function () {
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
        YouziOffLine.prototype.checkExposure = function () {
            if (this.isSendLog) {
                for (var i = 0; i < this.offLineGameShow.length; i++) {
                    YouziDataModule.YouziData.sendExposureLog(this.offLineGameShow[i], YouziDataModule.BI_PAGE_TYPE.OFFLINE);
                    if (i == this.offLineGameShow.length) {
                        this.isSendLog = false;
                    }
                }
            }
        };
        YouziOffLine.prototype.wxOnHide = function () {
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
        YouziOffLine.prototype.createOffLineDialog = function () {
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
            switch (offLineArr.length) {
                case 1:
                    this.OffLineList.width = 140;
                    this.OffLineList.centerX = 0;
                    break;
                case 2:
                    this.OffLineList.width = 305;
                    this.OffLineList.x = 111.5;
                    break;
                default:
                    break;
            }
            this.OffLineList.array = offLineArr;
            this.OffLineList.mouseHandler = new Handler(this, this.onOffLinelistItemMouseEvent);
            this.OffLineList.renderHandler = new Handler(this, this.onListRender);
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine, { complete: true });
            this.offLineCreateComplete = true;
        };
        YouziOffLine.prototype.onListRender = function (item, index) {
            var redhit = item.getChildByName('icon').getChildByName('redhit');
            if (this.offLineGameShow[index].hotred == 1) {
                redhit.visible = true;
            }
            else {
                redhit.visible = false;
            }
        };
        YouziOffLine.prototype.onBtnOffLineClose = function () {
            this.visible = false;
            this.OffLineUI.visible = false;
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_OffLine, { uiVisible: false });
        };
        YouziOffLine.prototype.onOffLinelistItemMouseEvent = function (e, index) {
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
        return YouziOffLine;
    }(ui.youzi.Youzi_OffLineUI));
    YouziOffLine_Module.YouziOffLine = YouziOffLine;
})(YouziOffLine_Module || (YouziOffLine_Module = {}));
