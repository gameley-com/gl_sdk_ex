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
var YouziMainPush = /** @class */ (function (_super) {
    __extends(YouziMainPush, _super);
    function YouziMainPush() {
        var _this = _super.call(this) || this;
        _this.mainRecDatas = [];
        _this.mainRecItemExposure = {};
        _this.angel = 0;
        _this.curMainRecIdx = 0;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.leftTween = null;
        _this.rightTween = null;
        _this.startTimer = true;
        _this.visible = false;
        _this.btnMainRecBg.visible = false;
        return _this;
    }
    YouziMainPush.prototype.setYouziPosition = function (x, y) {
        this.centerX = NaN;
        this.centerY = NaN;
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
    YouziMainPush.prototype.onEnable = function () {
        var isMainDataOk = YouziData_1.YouziData._isDataLoaded;
        if (isMainDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziMainPush.prototype.initShow = function () {
        this.mainRecDatas = YouziData_1.YouziData.mainRecDatas;
        if (this.mainRecDatas.length > 0) {
            this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
            this.visible = true;
            this.btnMainRecBg.visible = true;
            this.btnMainRecBg.rotation = 10;
            this.addMainAnimaOrImage();
            YouziData_1.YouziData.sendExposureLog(this.mainRecDatas[0], YouziData_1.BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[this.mainRecDatas[0].appid] = 1;
            this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_MainPush, { complete: true });
            this.startTimerLoop();
        }
    };
    YouziMainPush.prototype.startTimerLoop = function () {
        if (this.startTimer) {
            this.startTimer = false;
            if (this.mainRecDatas.length > 1) {
                Laya.timer.loop(5000, this, this.updateMainRec);
            }
            this.mainPushRotationAction();
        }
    };
    YouziMainPush.prototype.clearTimerLoop = function () {
        //清除计时器后，旋转角度变回10
        this.btnMainRecBg.rotation = 10;
        this.startTimer = true;
        if (this.mainRecDatas.length > 1) {
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
        this.rightTween = Laya.Tween.to(this.btnMainRecBg, { rotation: -10 }, 2000, null, new Laya.Handler(this, this.rotationLeft));
    };
    //像左边旋转
    YouziMainPush.prototype.rotationLeft = function (actionCompleteCall) {
        this.leftTween = Laya.Tween.to(this.btnMainRecBg, { rotation: 10 }, 2000, null, new Laya.Handler(this, this.rotatotionRight));
    };
    YouziMainPush.prototype.updateMainRec = function () {
        this.curMainRecIdx = this.curMainRecIdx + 1 >= this.mainRecDatas.length ? 0 : this.curMainRecIdx + 1;
        this.btnMainRec.graphics.clear(true);
        // this.btnMainRec.loadImage(this.mainRecDatas[this.curMainRecIdx].iconImg);
        this.addMainAnimaOrImage();
        this.slogan.text = this.mainRecDatas[this.curMainRecIdx].slogan;
        if (!this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid]) {
            YouziData_1.YouziData.sendExposureLog(this.mainRecDatas[this.curMainRecIdx], YouziData_1.BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid] = 1;
        }
    };
    YouziMainPush.prototype.addMainAnimaOrImage = function () {
        if (this.mainRecDatas[this.curMainRecIdx].dynamicType == 1 && this.mainRecDatas[this.curMainRecIdx].dynamicIcon) {
            var mainSelf = this;
            this.mainAnima.scale(0.75, 0.75);
            var mainYouziAnima = new YouziAtlasPngAnima_1["default"]();
            mainYouziAnima.createAnimation(this.mainRecDatas[this.curMainRecIdx].dynamicIcon, 
            // this.mainAnima,
            function (anima) {
                mainSelf.mainAnima.frames = anima.frames;
                mainSelf.mainAnima.interval = anima.interval;
                mainSelf.mainAnima.visible = true;
                mainSelf.mainAnima.play();
            });
        }
        else {
            this.btnMainRec.loadImage(this.mainRecDatas[this.curMainRecIdx].iconImg);
        }
        this.slogan.text = this.mainRecDatas[this.curMainRecIdx].slogan;
    };
    YouziMainPush.prototype.onBtnMainRecClicked = function () {
        YouziData_1.YouziData.clickGameYouziUIId = YouziData_1.YOUZI_UI_ID.Youzi_MainPush;
        var tmpData = this.mainRecDatas[this.curMainRecIdx];
        tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.MAIN;
        YouziData_1.YouziData.startOtherGame(tmpData, null);
        this.updateMainRec();
    };
    return YouziMainPush;
}(layaMaxUI_1.ui.youzi.Youzi_MainPushUI));
exports["default"] = YouziMainPush;
