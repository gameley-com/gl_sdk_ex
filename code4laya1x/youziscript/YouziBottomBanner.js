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
var YouziBottomBanner_Module;
(function (YouziBottomBanner_Module) {
    var YouziBottomBanner = /** @class */ (function (_super) {
        __extends(YouziBottomBanner, _super);
        function YouziBottomBanner(isOffSwitch) {
            var _this = _super.call(this) || this;
            _this.bannerType = 0;
            _this.bannerBottomItemExposure = {};
            //false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
            _this.isOffSwitch = false;
            _this.stopAction = false;
            _this.curFront = true;
            _this.curBack = false;
            _this.isClick = false;
            _this.dur = 10;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            _this.pos(Laya.stage.width / 2 - _this.BannerBottomUI.width, Laya.stage.height - _this.BannerBottomUI.height);
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
        YouziBottomBanner.prototype.onMyStart = function () {
            var isBottomDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (isBottomDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziBottomBanner.prototype.initShow = function () {
            if (YouziDataModule.YouziData.matrixBannerDatas.length <= 0) {
                console.log('中心化-底部推荐无数据');
                return;
            }
            this.loadBottomList();
            if (!this.isOffSwitch) {
                YouziDataModule.YouziData.addBanner(this);
            }
        };
        YouziBottomBanner.prototype.loadBottomList = function () {
            // this.bottomList.repeatX = this.matrixBannerDatas.length;
            var arr = [];
            var pRecord = null;
            for (var i = 0; i < YouziDataModule.YouziData.matrixBannerDatas.length; i++) {
                pRecord = YouziDataModule.YouziData.matrixBannerDatas[i];
                if (pRecord.dynamicType == 1 && pRecord.dynamicIcon) {
                    arr.push({ namelab: pRecord.title });
                }
                else {
                    arr.push({ icon: pRecord.iconImg, namelab: pRecord.title });
                }
            }
            this.bottomList.array = arr;
            this.bottomList.renderHandler = new Handler(this, this.onListRender);
            this.bottomList.mouseHandler = new Handler(this, this.onBannerItemMouseEvent);
            this.starBottomBannerAction();
        };
        YouziBottomBanner.prototype.onListRender = function (item, index) {
            // console.log('------->render bottombanner : ',index);
            if (YouziDataModule.YouziData.matrixBannerDatas[index].dynamicType == 1 && YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon) {
                var imgAnima = item.getChildByName('iconAnima');
                imgAnima.visible = true;
                var youziAnima = new YouziAtlasPngAnima_Module.YouziAtlasPngAnima();
                youziAnima.createAnimation(YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon, imgAnima, function (anima) {
                    imgAnima = anima;
                    imgAnima.play();
                });
            }
            this.checkSendExpsureLog(index);
        };
        YouziBottomBanner.prototype.checkSendExpsureLog = function (index) {
            if (this.visible && this.BannerBottomUI.visible) {
                if (!this.bannerBottomItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid]) {
                    // console.log('---send log index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.matrixBannerDatas[index], YouziDataModule.BI_PAGE_TYPE.MATRIX);
                    this.bannerBottomItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid] = 1;
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
                    YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner;
                    var tmpData = YouziDataModule.YouziData.matrixBannerDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MATRIX;
                    YouziDataModule.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
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
            if (YouziDataModule.YouziData.matrixBannerDatas.length <= 5) {
                return;
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.matrixBannerDatas.length - 5) * 5000;
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
                this.bottomList.tweenTo(YouziDataModule.YouziData.matrixBannerDatas.length - 1, this.dur, endCompletHandler);
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
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner, { uiVisible: true });
            }
        };
        YouziBottomBanner.prototype.hideBanner = function () {
            if (this) {
                this.visible = true;
                this.BannerBottomUI.visible = true;
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_BottomBanner, { uiVisible: false });
            }
        };
        YouziBottomBanner.prototype.destroySelf = function () {
            if (this) {
                this.removeSelf();
            }
        };
        return YouziBottomBanner;
    }(ui.youzi.Youzi_BottomBannerUI));
    YouziBottomBanner_Module.YouziBottomBanner = YouziBottomBanner;
})(YouziBottomBanner_Module || (YouziBottomBanner_Module = {}));
