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
var YouziMoreGame_Module;
(function (YouziMoreGame_Module) {
    var YouziMoreGame = /** @class */ (function (_super) {
        __extends(YouziMoreGame, _super);
        function YouziMoreGame() {
            var _this = _super.call(this) || this;
            _this.mainItemExposure = {};
            _this.mainItemExposureCount = 0;
            _this.fisrtShow = false;
            _this.isCreate = false;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            _this.curFront = true;
            _this.curBack = false;
            _this.stopAction = false;
            _this.isClick = false;
            _this.dur = 5000;
            _this.centerX = 0;
            _this.centerY = 0;
            _this.visible = false;
            _this.MoreGameUI.visible = false;
            _this.moreGameList.scrollBar.hide = true;
            return _this;
        }
        YouziMoreGame.prototype.setYouziPosition = function (x, y) {
            this.MoreGameUI.pos(x, y);
        };
        //传入UI是否创建完成通知对象
        YouziMoreGame.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziMoreGame.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziMoreGame.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziMoreGame.prototype.setUIStateCall = function (uiStateCall) {
            this.uiStateCallCopy = uiStateCall;
        };
        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziMoreGame.prototype.notifyUIState = function (uiID, msg) {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy(uiID, msg);
            }
        };
        YouziMoreGame.prototype.offUIStateCall = function () {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy = null;
            }
        };
        YouziMoreGame.prototype.onMyStart = function () {
            var isMoreGameOk = YouziDataModule.YouziData._isDataLoaded;
            if (isMoreGameOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziMoreGame.prototype.showMoreGameUI = function () {
            if (this.isCreate && !this.visible) {
                this.visible = true;
                this.moreGameList.mouseThrough = false;
                this.MoreGameUI.visible = true;
                this.starMoreGameAction();
                this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGame, { uiVisible: true });
                this.checkExposure();
            }
        };
        YouziMoreGame.prototype.initShow = function () {
            if (YouziDataModule.YouziData.moreDatas.length > 0) {
                var arr = [];
                for (var i = 0; i < YouziDataModule.YouziData.moreDatas.length; i++) {
                    var pRecord = YouziDataModule.YouziData.moreDatas[i];
                    arr.push({ icon: pRecord.iconImg, namelab: pRecord.title, infoData: pRecord });
                }
                this.moreGameList.array = arr;
                this.moreGameList.renderHandler = new Handler(this, this.onListRender);
                this.moreGameList.mouseHandler = new Handler(this, this.moreGameListMouseEvent);
                this.moreGameCloseBtn.on(Laya.Event.CLICK, this, this.onBtnCloseClicked);
                this.isCreate = true;
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGame, { complete: true });
            }
        };
        YouziMoreGame.prototype.onBtnCloseClicked = function () {
            this.stopMoreGameAcion();
            this.visible = false;
            this.moreGameList.mouseThrough = true;
            this.MoreGameUI.visible = false;
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_MoreGame, { uiVisible: false });
        };
        YouziMoreGame.prototype.onListRender = function (item, index) {
            // console.log('------->render moregame : ',index);
            this.checkSendExpsureLog(index);
        };
        YouziMoreGame.prototype.checkSendExpsureLog = function (index) {
            if (this.visible && this.MoreGameUI.visible) {
                if (!this.mainItemExposure[YouziDataModule.YouziData.moreDatas[index].appid]) {
                    // console.log('---send log moregame index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.moreDatas[index], YouziDataModule.BI_PAGE_TYPE.MORE);
                    this.mainItemExposure[YouziDataModule.YouziData.moreDatas[index].appid] = 1;
                }
            }
        };
        YouziMoreGame.prototype.stopMoreGameAcion = function () {
            this.stopAction = true;
        };
        YouziMoreGame.prototype.starMoreGameAction = function () {
            this.moreGameListAutoScroll();
        };
        YouziMoreGame.prototype.moreGameListAutoScroll = function () {
            if (!this.MoreGameUI.visible)
                return;
            if (YouziDataModule.YouziData.moreDatas.length <= 12) {
                return;
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.moreDatas.length - 12) * 3000;
            //当前是从前面开始向后，但是未到后面
            if (this.curFront && !this.curBack) {
                this.listTweenToEnd();
            }
            else if (!this.curFront && this.curBack) {
                this.listTweenToStart();
            }
        };
        YouziMoreGame.prototype.listTweenToEnd = function () {
            if (!this.stopAction) {
                var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
                this.moreGameList.tweenTo(YouziDataModule.YouziData.moreDatas.length - 1, this.dur, endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        };
        YouziMoreGame.prototype.listTweenToStart = function () {
            if (!this.stopAction) {
                var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
                this.moreGameList.tweenTo(0, this.dur, startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        };
        YouziMoreGame.prototype.moreGameListMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                if (!this.isClick) {
                    this.isClick = true;
                    console.log("当前选择的更多游戏索引：" + index);
                    var tmpData = YouziDataModule.YouziData.moreDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MORE;
                    YouziDataModule.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                }
            }
            else if (e.type == 'mouseover') {
            }
        };
        YouziMoreGame.prototype.startOtherCall = function () {
            this.isClick = false;
            this.starMoreGameAction();
        };
        YouziMoreGame.prototype.checkExposure = function () {
            if (this.MoreGameUI.visible) {
                for (var i = 0; i < YouziDataModule.YouziData.moreDatas.length; i++) {
                    var infoData = YouziDataModule.YouziData.moreDatas[i];
                    if (!this.mainItemExposure[infoData.appid]) {
                        this.mainItemExposure[infoData.appid] = 1;
                        YouziDataModule.YouziData.sendExposureLog(infoData, YouziDataModule.BI_PAGE_TYPE.MORE);
                    }
                    if (i >= 11) {
                        break;
                    }
                }
            }
        };
        return YouziMoreGame;
    }(ui.youzi.Youzi_MoreGameUI));
    YouziMoreGame_Module.YouziMoreGame = YouziMoreGame;
})(YouziMoreGame_Module || (YouziMoreGame_Module = {}));
