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
var YouziFullMatrixScreen = /** @class */ (function (_super) {
    __extends(YouziFullMatrixScreen, _super);
    function YouziFullMatrixScreen() {
        var _this = _super.call(this) || this;
        _this.fullScreenData = [];
        _this.fullScreenExposure = {};
        _this.hw = 0;
        _this.breaki = 15;
        _this.curFront = true;
        _this.curBack = false;
        _this.stopAction = false;
        _this.isClick = false;
        _this.dur = 5000;
        _this.visible = false;
        _this.FullScreenUI.visible = false;
        // this.FullScreenList.scrollBar.hide = true;
        _this.scaleX = 0;
        _this.scaleY = 0;
        _this.pivotX = _this.width / 2;
        _this.pivotY = _this.height / 2;
        _this.FullScreenList.vScrollBarSkin = "";
        if (Laya.stage.width < Laya.stage.height) {
            _this.hw = Laya.Browser.height / Laya.Browser.width;
        }
        else {
            _this.hw = Laya.Browser.width / Laya.Browser.height;
        }
        if (_this.hw > 1.9) {
            //全面屏
            _this.height = 1500;
            _this.FullScreenUI.height = 1500;
            _this.FullScreenList.repeatX = 3;
            _this.FullScreenList.repeatY = 5;
            _this.FullScreenList.height = 1280;
            _this.pos(Laya.stage.width / 2, Laya.stage.height / 2 - 120);
            _this.breaki = 15;
        }
        else {
            _this.pos(Laya.stage.width / 2, Laya.stage.height / 2);
        }
        return _this;
    }
    YouziFullMatrixScreen.prototype.onEnable = function () {
        var screenDataOk = YouziData_1.YouziData._isDataLoaded;
        if (screenDataOk) {
            this.initShow();
        }
        else {
            YouziData_1.YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    };
    YouziFullMatrixScreen.prototype.initShow = function () {
        this.fullScreenData = YouziData_1.YouziData.fullMatrixScreenDatas;
        if (this.fullScreenData.length > 0) {
            this.dur = this.fullScreenData.length > 12 ? (this.fullScreenData.length - 12) * 5000 : 5000;
            this.closeFullScreen.on(Laya.Event.CLICK, this, this.onCloseFullScreen);
            var fullScreenListArr = [];
            for (var i = 0; i < this.fullScreenData.length; i++) {
                if (this.fullScreenData[i].dynamicType == 1 && this.fullScreenData[i].dynamicIcon) {
                    fullScreenListArr.push({ icon: "", namelab: this.fullScreenData[i].title });
                }
                else {
                    fullScreenListArr.push({ icon: this.fullScreenData[i].iconImg, namelab: this.fullScreenData[i].title });
                }
            }
            this.FullScreenList.array = fullScreenListArr;
            this.FullScreenList.mouseHandler = new Laya.Handler(this, this.onItemClick);
            this.FullScreenList.renderHandler = new Laya.Handler(this, this.onListRender);
        }
        else {
            console.log('全屏落地页无数据');
        }
    };
    YouziFullMatrixScreen.prototype.onListRender = function (box, index) {
        if (this.fullScreenData[index].hotred == 0) {
            var redhit = box.getChildByName("redhit");
            redhit.visible = false;
        }
        // console.log('======>index:'+index);
        var iconAnima = box.getChildByName("iconAnima");
        iconAnima.frames = [];
        if (this.fullScreenData[index].dynamicType == 1 && this.fullScreenData[index].dynamicIcon) {
            // console.log('======>index:'+index+",dynamicType:"+this.fullScreenData[index].dynamicType+",dynamicIcon:"+this.fullScreenData[index].dynamicIcon);   
            iconAnima.scale(1.66, 1.66);
            var youziAnima = new YouziAtlasPngAnima_1["default"]();
            youziAnima.createAnimation(this.fullScreenData[index].dynamicIcon, 
            // iconAnima,
            function (anima) {
                // console.log('anima play index:'+index);
                iconAnima.frames = anima.frames;
                iconAnima.interval = anima.interval;
                iconAnima.play();
            });
        }
        this.checkSendExpsureLog(index);
    };
    YouziFullMatrixScreen.prototype.checkSendExpsureLog = function (index) {
        if (this.FullScreenUI.visible) {
            if (!this.fullScreenExposure[this.fullScreenData[index].appid]) {
                // console.log('---send log moregame index:',index);
                YouziData_1.YouziData.sendExposureLog(this.fullScreenData[index], YouziData_1.BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.fullScreenExposure[this.fullScreenData[index].appid] = 1;
            }
        }
    };
    YouziFullMatrixScreen.prototype.showFullScreen = function () {
        if (this && this.parent) {
            this.visible = true;
            this.FullScreenUI.visible = true;
            Laya.Tween.to(this, { scaleX: 1, scaleY: 1 }, 500, Laya.Ease.quadIn, Laya.Handler.create(this, this.showActionFinsh));
        }
    };
    YouziFullMatrixScreen.prototype.showActionFinsh = function () {
        this.checkExposure();
        this.starFullListAction();
    };
    YouziFullMatrixScreen.prototype.onCloseFullScreen = function () {
        this.stopFullListAcion();
        Laya.Tween.to(this, { scaleX: 0, scaleY: 0 }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this, this.closeActionFinsh));
    };
    YouziFullMatrixScreen.prototype.closeActionFinsh = function () {
        this.visible = false;
        this.FullScreenUI.visible = false;
        this.fullScreenExposure = {};
    };
    YouziFullMatrixScreen.prototype.stopFullListAcion = function () {
        this.stopAction = true;
    };
    YouziFullMatrixScreen.prototype.starFullListAction = function () {
        this.fullScreenListAutoScroll();
    };
    YouziFullMatrixScreen.prototype.fullScreenListAutoScroll = function () {
        if (!this.FullScreenUI.visible)
            return;
        if (this.fullScreenData.length <= 15) {
            return;
        }
        this.stopAction = false;
        //当前是从前面开始向后，但是未到后面
        if (this.curFront && !this.curBack) {
            this.listTweenToEnd();
        }
        else if (!this.curFront && this.curBack) {
            this.listTweenToStart();
        }
    };
    YouziFullMatrixScreen.prototype.listTweenToEnd = function () {
        if (!this.stopAction) {
            var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
            this.FullScreenList.tweenTo(this.fullScreenData.length - 1, this.dur, endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    };
    YouziFullMatrixScreen.prototype.listTweenToStart = function () {
        if (!this.stopAction) {
            var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
            this.FullScreenList.tweenTo(0, this.dur, startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    };
    YouziFullMatrixScreen.prototype.onItemClick = function (e, index) {
        if (e.type == 'mousedown') {
        }
        else if (e.type == 'mouseup') {
            console.log("当前选择的全屏落地页索引：" + index);
            var tmpData = this.fullScreenData[index];
            tmpData.locationIndex = YouziData_1.BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData_1.YouziData.startOtherGame(tmpData, null);
            // if(tmpData.hotred == 1){
            //     var tmpSlideHit:Laya.Image = this.FullScreenList.getCell(index).getChildByName('redhit') as Laya.Image;
            //     tmpSlideHit.visible = false;
            //     this.fullScreenData[index].hotred = 0;
            // }
        }
        else if (e.type == 'mouseover') {
        }
    };
    YouziFullMatrixScreen.prototype.checkExposure = function () {
        if (this.FullScreenUI.visible) {
            for (var i = 0; i < this.fullScreenData.length; i++) {
                var infoData = this.fullScreenData[i];
                if (!this.fullScreenExposure[infoData.appid]) {
                    this.fullScreenExposure[infoData.appid] = 1;
                    YouziData_1.YouziData.sendExposureLog(infoData, YouziData_1.BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                }
                if (i >= this.breaki) {
                    break;
                }
            }
        }
    };
    return YouziFullMatrixScreen;
}(layaMaxUI_1.ui.youzi.Youzi_FullScreenUI));
exports["default"] = YouziFullMatrixScreen;
