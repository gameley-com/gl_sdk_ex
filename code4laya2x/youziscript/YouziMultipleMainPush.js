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
var YouziMultipleMainPush = /** @class */ (function (_super) {
    __extends(YouziMultipleMainPush, _super);
    function YouziMultipleMainPush(mainData) {
        var _this = _super.call(this) || this;
        _this.mainRecData = null;
        _this.mainRecItemExposure = {};
        _this.angel = 0;
        _this.curMainRecIdx = 0;
        _this.uiCompleteCallCopy = null;
        _this.uiStateCallCopy = null;
        _this.leftTween = null;
        _this.rightTween = null;
        _this.startTimer = true;
        _this.mainRecData = mainData;
        _this.visible = false;
        _this.btnMainRecBg.visible = false;
        return _this;
    }
    YouziMultipleMainPush.prototype.setYouziPosition = function (x, y) {
        this.centerX = NaN;
        this.centerY = NaN;
        this.pos(x, y);
    };
    //传入UI是否创建完成通知对象
    YouziMultipleMainPush.prototype.setUICompleteCall = function (uiCompleteCall) {
        this.uiCompleteCallCopy = uiCompleteCall;
    };
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMultipleMainPush.prototype.notifyUIComplete = function (uiID, msg) {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy(uiID, msg);
        }
    };
    YouziMultipleMainPush.prototype.offUICompleteCall = function () {
        if (this.uiCompleteCallCopy) {
            this.uiCompleteCallCopy = null;
        }
    };
    YouziMultipleMainPush.prototype.setUIStateCall = function (uiStateCall) {
        this.uiStateCallCopy = uiStateCall;
    };
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    YouziMultipleMainPush.prototype.notifyUIState = function (uiID, msg) {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy(uiID, msg);
        }
    };
    YouziMultipleMainPush.prototype.offUIStateCall = function () {
        if (this.uiStateCallCopy) {
            this.uiStateCallCopy = null;
        }
    };
    YouziMultipleMainPush.prototype.onEnable = function () {
        var isMainDataOk = YouziData_1.YouziData._isDataLoaded;
        if (isMainDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziMultipleMainPush.prototype.initShow = function () {
        if (this.mainRecData) {
            this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
            this.visible = true;
            this.btnMainRecBg.visible = true;
            this.btnMainRecBg.rotation = 10;
            this.addMainAnimaOrImage();
            YouziData_1.YouziData.sendExposureLog(this.mainRecData, YouziData_1.BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[this.mainRecData.appid] = 1;
            this.notifyUIComplete(YouziData_1.YOUZI_UI_ID.Youzi_MainPush, { complete: true });
            this.startTimerLoop();
        }
    };
    YouziMultipleMainPush.prototype.startTimerLoop = function () {
        // if(this.mainRecDatas.length > 1){
        //     Laya.timer.loop(5000,this,this.updateMainRec);
        // }
        if (this.startTimer) {
            this.startTimer = false;
            this.mainPushRotationAction();
        }
    };
    YouziMultipleMainPush.prototype.clearTimerLoop = function () {
        //清除计时器后，旋转角度变回10
        this.btnMainRecBg.rotation = 10;
        this.startTimer = true;
        // if(this.mainRecDatas.length > 1){
        //     Laya.timer.clear(this,this.updateMainRec);
        // }
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
    YouziMultipleMainPush.prototype.mainPushRotationAction = function () {
        this.rotatotionRight();
    };
    //向右边旋转
    YouziMultipleMainPush.prototype.rotatotionRight = function () {
        this.rightTween = Laya.Tween.to(this.btnMainRecBg, { rotation: -10 }, 2000, null, new Laya.Handler(this, this.rotationLeft));
    };
    //像左边旋转
    YouziMultipleMainPush.prototype.rotationLeft = function (actionCompleteCall) {
        this.leftTween = Laya.Tween.to(this.btnMainRecBg, { rotation: 10 }, 2000, null, new Laya.Handler(this, this.rotatotionRight));
    };
    YouziMultipleMainPush.prototype.updateMainRecMultiple = function (mainPushData) {
        this.mainRecData = mainPushData;
        this.btnMainRec.graphics.clear(true);
        this.addMainAnimaOrImage();
        if (!this.mainRecItemExposure[mainPushData.appid]) {
            YouziData_1.YouziData.sendExposureLog(mainPushData, YouziData_1.BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[mainPushData.appid] = 1;
        }
    };
    YouziMultipleMainPush.prototype.addMainAnimaOrImage = function () {
        if (this.mainRecData.dynamicType == 1 && this.mainRecData.dynamicIcon) {
            var mainSelf = this;
            mainSelf.mainAnima.scale(0.75, 0.75);
            var mainYouziAnima = new YouziAtlasPngAnima_1["default"]();
            mainYouziAnima.createAnimation(this.mainRecData.dynamicIcon, 
            // this.mainAnima,
            function (anima) {
                mainSelf.mainAnima = anima;
                mainSelf.mainAnima.visible = true;
                mainSelf.mainAnima.play();
            });
        }
        else {
            this.btnMainRec.loadImage(this.mainRecData.iconImg);
        }
        this.slogan.text = this.mainRecData.slogan;
    };
    YouziMultipleMainPush.prototype.onBtnMainRecClicked = function () {
        YouziData_1.YouziData.clickGameYouziUIId = YouziData_1.YOUZI_UI_ID.Youzi_MainPush;
        this.mainRecData.locationIndex = YouziData_1.BI_PAGE_TYPE.MAIN;
        YouziData_1.YouziData.startOtherGame(this.mainRecData, null);
        // this.updateMainRec();
    };
    return YouziMultipleMainPush;
}(layaMaxUI_1.ui.youzi.Youzi_MainPushUI));
exports["default"] = YouziMultipleMainPush;
