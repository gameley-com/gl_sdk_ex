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
var YouziGuessLikeH_Module;
(function (YouziGuessLikeH_Module) {
    var YouziGuessLikeH = /** @class */ (function (_super) {
        __extends(YouziGuessLikeH, _super);
        function YouziGuessLikeH() {
            var _this = _super.call(this) || this;
            _this.guessAnyItemExposure = {};
            _this.firstShow = false;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            _this.curFront = true;
            _this.curBack = false;
            _this.stopAction = false;
            _this.isClick = false;
            _this.dur = 10;
            _this.visible = false;
            _this.guessUI.visible = false;
            _this.guessList.scrollBar.hide = true;
            return _this;
        }
        YouziGuessLikeH.prototype.setYouziPosition = function (x, y) {
            this.pos(x, y);
        };
        //传入UI是否创建完成通知对象
        YouziGuessLikeH.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziGuessLikeH.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziGuessLikeH.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziGuessLikeH.prototype.setUIStateCall = function (uiStateCall) {
            this.uiStateCallCopy = uiStateCall;
        };
        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziGuessLikeH.prototype.notifyUIState = function (uiID, msg) {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy(uiID, msg);
            }
        };
        YouziGuessLikeH.prototype.offUIStateCall = function () {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy = null;
            }
        };
        YouziGuessLikeH.prototype.onMyStart = function () {
            var guessLikeDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (guessLikeDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziGuessLikeH.prototype.initShow = function () {
            if (YouziDataModule.YouziData.matrixBannerDatas.length <= 0) {
                return;
            }
            var arr = [];
            for (var i = 0; i < YouziDataModule.YouziData.matrixBannerDatas.length; i++) {
                if (YouziDataModule.YouziData.matrixBannerDatas[i].dynamicType == 1 &&
                    YouziDataModule.YouziData.matrixBannerDatas[i].dynamicIcon) {
                    arr.push({});
                }
                else {
                    arr.push({ icon: YouziDataModule.YouziData.matrixBannerDatas[i].iconImg });
                }
            }
            this.guessList.array = arr;
            this.guessList.renderHandler = new Handler(this, this.onListRender);
            this.guessList.mouseHandler = new Handler(this, this.onGuessLikeItemMouseEvent);
            this.visible = true;
            this.guessUI.visible = true;
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_GuessLikeH, { complete: true });
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GuessLikeH, { uiVisible: true });
            this.starGuessLikeHAction();
        };
        YouziGuessLikeH.prototype.onListRender = function (item, index) {
            //  console.log('------->render guesslikeh : ',index);
            if (YouziDataModule.YouziData.matrixBannerDatas[index].dynamicType == 1 &&
                YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon) {
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
        YouziGuessLikeH.prototype.checkSendExpsureLog = function (index) {
            if (this.visible && this.guessUI.visible) {
                if (!this.guessAnyItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid]) {
                    // console.log('---send log index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.matrixBannerDatas[index], YouziDataModule.BI_PAGE_TYPE.GUESS);
                    this.guessAnyItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid] = 1;
                }
            }
        };
        YouziGuessLikeH.prototype.stopGuessLikeHAcion = function () {
            this.stopAction = true;
        };
        YouziGuessLikeH.prototype.starGuessLikeHAction = function () {
            this.guessAnylistAutoScroll();
        };
        YouziGuessLikeH.prototype.guessAnylistAutoScroll = function () {
            if (!this.guessUI.visible)
                return;
            if (YouziDataModule.YouziData.matrixBannerDatas.length <= 5) {
                return;
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.matrixBannerDatas.length - 5) * 5000;
            //当前是从前面开始向后，但是未到后面
            if (this.curFront && !this.curBack) {
                this.listTweenToEnd();
            }
            else if (!this.curFront && this.curBack) {
                this.listTweenToStart();
            }
        };
        YouziGuessLikeH.prototype.listTweenToEnd = function () {
            if (!this.stopAction) {
                var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
                this.guessList.tweenTo(YouziDataModule.YouziData.matrixBannerDatas.length - 1, this.dur, endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        };
        YouziGuessLikeH.prototype.listTweenToStart = function () {
            if (!this.stopAction) {
                var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
                this.guessList.tweenTo(0, this.dur, startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        };
        YouziGuessLikeH.prototype.onGuessLikeItemMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                if (!this.isClick) {
                    this.isClick = true;
                    console.log("当前选择的guesslikeh索引：" + index);
                    YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_GuessLikeH;
                    var tmpData = YouziDataModule.YouziData.matrixBannerDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.GUESS;
                    YouziDataModule.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                }
            }
            else if (e.type == 'mouseover') {
            }
        };
        YouziGuessLikeH.prototype.startOtherCall = function (state) {
            this.isClick = false;
            this.starGuessLikeHAction();
        };
        return YouziGuessLikeH;
    }(ui.youzi.Youzi_GuessLikeHUI));
    YouziGuessLikeH_Module.YouziGuessLikeH = YouziGuessLikeH;
})(YouziGuessLikeH_Module || (YouziGuessLikeH_Module = {}));
