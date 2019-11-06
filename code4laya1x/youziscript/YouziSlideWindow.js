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
var YouziSlideWindow_Module;
(function (YouziSlideWindow_Module) {
    var YouziSlideWindow = /** @class */ (function (_super) {
        __extends(YouziSlideWindow, _super);
        function YouziSlideWindow(leftOrRight) {
            var _this = _super.call(this) || this;
            _this.slideItemExposure = {};
            _this.slideItemExposureCount = 0;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            _this.slideButton = null;
            _this.slideMask = null;
            _this.showFirst = false;
            _this.isLeft = false;
            _this.isLeft = leftOrRight;
            _this.centerY = 0;
            _this.visible = false;
            _this.SlideWindowUI.visible = false;
            _this.slideList.scrollBar.hide = true;
            if (!leftOrRight) {
                _this.right = -_this.width;
                _this.slideBg.scaleX = -1;
                _this.slideBg.pos(_this.slideBg.width, _this.slideBg.y);
                _this.slideList.pos(2 * _this.slideList.x, _this.slideList.y);
            }
            else {
                _this.left = -_this.width;
            }
            return _this;
        }
        YouziSlideWindow.prototype.setYouziPosition = function (y) {
            this.centerX = NaN;
            this.centerY = NaN;
            this.SlideWindowUI.pos(this.SlideWindowUI.x, y);
        };
        YouziSlideWindow.prototype.setSlideButton = function (slideBtn) {
            this.slideButton = slideBtn;
        };
        YouziSlideWindow.prototype.setSlideMask = function (slideViewMask) {
            this.slideMask = slideViewMask;
        };
        //传入UI是否创建完成通知对象
        YouziSlideWindow.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziSlideWindow.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziSlideWindow.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziSlideWindow.prototype.setUIStateCall = function (uiStateCall) {
            this.uiStateCallCopy = uiStateCall;
        };
        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziSlideWindow.prototype.notifyUIState = function (uiID, msg) {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy(uiID, msg);
            }
        };
        YouziSlideWindow.prototype.offUIStateCall = function () {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy = null;
            }
        };
        //显示抽屉按钮，隐藏抽屉遮罩
        YouziSlideWindow.prototype.showSlideBtnAndHideSlideMask = function () {
            if (this.slideButton)
                this.slideButton.visible = true;
            if (this.slideMask)
                this.slideMask.visible = false;
        };
        //隐藏抽屉按钮，显示抽屉遮罩
        YouziSlideWindow.prototype.hideSlideBtnAndShowSlideMask = function () {
            if (this.slideButton)
                this.slideButton.visible = false;
            if (this.slideMask)
                this.slideMask.visible = true;
        };
        YouziSlideWindow.prototype.showSlideWindow = function () {
            if (YouziDataModule.YouziData.hotListDatas.length <= 0) {
                console.log('抽屉没有数据');
                return;
            }
            if (!this.SlideWindowUI.visible) {
                this.visible = true;
                this.SlideWindowUI.visible = true;
                this.hideSlideBtnAndShowSlideMask();
                var self = this;
                this.slideWindowActionShow(function () {
                    self.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_SlideWindow, { uiVisible: true });
                    if (!self.showFirst) {
                        self.showFirst = true;
                        self.checkExposure();
                    }
                });
            }
        };
        YouziSlideWindow.prototype.slideWindowActionShow = function (actionFinishCall) {
            if (!this.isLeft) {
                Laya.Tween.to(this, {
                    right: 0
                }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, actionFinishCall));
            }
            else {
                Laya.Tween.to(this, {
                    left: 0
                }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, actionFinishCall));
            }
        };
        YouziSlideWindow.prototype.closeSlideWindow = function () {
            if (YouziDataModule.YouziData.hotListDatas.length <= 0) {
                console.log('抽屉没有数据');
                return;
            }
            var self = this;
            this.slideWindowActionClose(function () {
                self.visible = false;
                self.SlideWindowUI.visible = false;
                self.btnSLideClose.visible = true;
                self.showSlideBtnAndHideSlideMask();
                self.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_SlideWindow, { uiVisible: false });
            });
            //点击隐藏按钮，防止动画过程中继续点击造成过多偏移
            self.btnSLideClose.visible = false;
        };
        YouziSlideWindow.prototype.slideWindowActionClose = function (actionFinishCall) {
            if (!this.isLeft) {
                Laya.Tween.to(this, {
                    right: -this.width
                }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, actionFinishCall));
            }
            else {
                Laya.Tween.to(this, {
                    left: -this.width
                }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, actionFinishCall));
            }
        };
        YouziSlideWindow.prototype.onMyStart = function () {
            var isSlideDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (isSlideDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziSlideWindow.prototype.initShow = function () {
            this.btnSLideClose.on(Laya.Event.CLICK, this, this.closeSlideWindow);
            if (YouziDataModule.YouziData.hotListDatas.length > 0) {
                var arr = [];
                for (var i = 0; i < YouziDataModule.YouziData.hotListDatas.length; i++) {
                    var pRecord = YouziDataModule.YouziData.hotListDatas[i];
                    arr.push({ icon: pRecord.iconImg, namelab: pRecord.title });
                }
                this.slideList.dataSource = arr;
                this.slideList.renderHandler = new Laya.Handler(this, this.onListRender);
                this.slideList.mouseHandler = new Laya.Handler(this, this.onslideListItemMouseEvent);
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_SlideWindow, { complete: true });
            }
        };
        YouziSlideWindow.prototype.onListRender = function (item, index) {
            //console.log('------->render slidewindow : ',index);
            this.checkSendExpsureLog(index);
        };
        YouziSlideWindow.prototype.checkSendExpsureLog = function (index) {
            if (this.visible && this.SlideWindowUI.visible) {
                if (!this.slideItemExposure[YouziDataModule.YouziData.hotListDatas[index].appid]) {
                    // console.log('---send log moregame index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.hotListDatas[index], YouziDataModule.BI_PAGE_TYPE.FLOAT);
                    this.slideItemExposure[YouziDataModule.YouziData.hotListDatas[index].appid] = 1;
                }
            }
        };
        YouziSlideWindow.prototype.onslideListItemMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                console.log("当前选择的抽屉索引：" + index);
                var tmpData = YouziDataModule.YouziData.hotListDatas[index];
                tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.FLOAT;
                YouziDataModule.YouziData.startOtherGame(tmpData, null);
                if (tmpData.hotred == 1) {
                    var tmpSlideHit = this.slideList.getCell(index).getChildByName('icon').getChildByName('markImg');
                    tmpSlideHit.visible = false;
                }
            }
            else if (e.type == 'mouseover') {
            }
        };
        YouziSlideWindow.prototype.checkExposure = function () {
            if (this.SlideWindowUI.visible) {
                for (var i = 0; i < YouziDataModule.YouziData.hotListDatas.length; i++) {
                    var infoData = YouziDataModule.YouziData.hotListDatas[i];
                    // console.log(infoData)
                    if (!this.slideItemExposure[infoData.appid]) {
                        this.slideItemExposure[infoData.appid] = 1;
                        YouziDataModule.YouziData.sendExposureLog(infoData, YouziDataModule.BI_PAGE_TYPE.FLOAT);
                    }
                    if (i >= 11)
                        break;
                }
            }
        };
        return YouziSlideWindow;
    }(ui.youzi.Youzi_SlideWindowUI));
    YouziSlideWindow_Module.YouziSlideWindow = YouziSlideWindow;
})(YouziSlideWindow_Module || (YouziSlideWindow_Module = {}));
