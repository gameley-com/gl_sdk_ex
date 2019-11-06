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
var YouziMainPush_Module;
(function (YouziMainPush_Module) {
    var YouziMainPush = /** @class */ (function (_super) {
        __extends(YouziMainPush, _super);
        function YouziMainPush() {
            var _this = _super.call(this) || this;
            _this.mainRecItemExposure = {};
            _this.angel = 0;
            _this.curMainRecIndex = 0;
            _this.uiCompleteCallCopy = null;
            _this.uiStateCallCopy = null;
            _this.leftTween = null;
            _this.rightTween = null;
            _this.visible = false;
            return _this;
        }
        YouziMainPush.prototype.setYouziPosition = function (x, y) {
            this.pos(x, y);
        };
        //传入UI是否创建完成通知对象
        YouziMainPush.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziMainPush.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziMainPush.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziMainPush.prototype.setUIStateCall = function (uiStateCall) {
            this.uiStateCallCopy = uiStateCall;
        };
        /**通知UI界面状态
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziMainPush.prototype.notifyUIState = function (uiID, msg) {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy(uiID, msg);
            }
        };
        YouziMainPush.prototype.offUIStateCall = function () {
            if (this.uiStateCallCopy) {
                this.uiStateCallCopy = null;
            }
        };
        YouziMainPush.prototype.onMyStart = function () {
            var isMainDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (isMainDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziMainPush.prototype.initShow = function () {
            if (YouziDataModule.YouziData.mainRecDatas.length > 0) {
                this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
                this.pushIcon.loadImage(YouziDataModule.YouziData.mainRecDatas[0].iconImg, 0, 0, 92, 90);
                this.slogan.text = YouziDataModule.YouziData.mainRecDatas[0].slogan;
                this.btnMainRecBg.rotation = 10;
                this.visible = true;
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_MainPush, { complete: true });
                YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.mainRecDatas[0], YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.startTimerLoop();
            }
        };
        YouziMainPush.prototype.startTimerLoop = function () {
            if (YouziDataModule.YouziData.mainRecDatas.length > 1) {
                Laya.timer.loop(5000, this, this.updateMainRec);
            }
            this.mainPushRotationAction();
        };
        YouziMainPush.prototype.clearTimerLoop = function () {
            //清除计时器后，旋转角度变回10
            this.btnMainRecBg.rotation = 10;
            if (YouziDataModule.YouziData.mainRecDatas.length > 1) {
                Laya.timer.clear(this, this.updateMainRec);
            }
            if (this.leftTween) {
                Laya.Tween.clear(this.leftTween);
            }
            if (this.rightTween) {
                Laya.Tween.clear(this.rightTween);
            }
        };
        /**
         * 主推动画
         * 1、默认角度是10
         * 2、向右转到-10
         * 3、完成之后向左转到10
         * 4、重复2、3
         */
        YouziMainPush.prototype.mainPushRotationAction = function () {
            this.rotatotionRight();
        };
        //向右边旋转
        YouziMainPush.prototype.rotatotionRight = function () {
            this.rightTween = Laya.Tween.to(this.btnMainRecBg, { rotation: -10 }, 2000, null, new Handler(this, this.rotationLeft));
        };
        //像左边旋转
        YouziMainPush.prototype.rotationLeft = function (actionCompleteCall) {
            this.leftTween = Laya.Tween.to(this.btnMainRecBg, { rotation: 10 }, 2000, null, new Handler(this, this.rotatotionRight));
        };
        YouziMainPush.prototype.updateMainRec = function () {
            this.curMainRecIndex = this.curMainRecIndex + 1 >= YouziDataModule.YouziData.mainRecDatas.length ? 0 : this.curMainRecIndex + 1;
            //清除上一次的绘制
            this.pushIcon.graphics.clear(true);
            this.pushIcon.loadImage(YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].iconImg, 0, 0, 92, 90);
            this.slogan.text = YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].slogan;
            if (!this.mainRecItemExposure[YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].appid]) {
                YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex], YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.mainRecItemExposure[YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].appid] = 1;
            }
        };
        YouziMainPush.prototype.onBtnMainRecClicked = function () {
            console.log('点击主推:', this.curMainRecIndex);
            YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_MainPush;
            var tmpData = YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex];
            tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MAIN;
            YouziDataModule.YouziData.startOtherGame(tmpData, null);
            this.updateMainRec();
        };
        return YouziMainPush;
    }(ui.youzi.Youzi_MainPushUI));
    YouziMainPush_Module.YouziMainPush = YouziMainPush;
})(YouziMainPush_Module || (YouziMainPush_Module = {}));
