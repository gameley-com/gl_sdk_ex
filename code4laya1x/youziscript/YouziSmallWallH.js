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
var YouziSmallWallH_Module;
(function (YouziSmallWallH_Module) {
    var YouziSmallWallH = /** @class */ (function (_super) {
        __extends(YouziSmallWallH, _super);
        function YouziSmallWallH() {
            var _this = _super.call(this) || this;
            _this.smallWallHDatas = [];
            _this.smallWallHItemExposure = {};
            _this.smallWallHItemExposureCount = 0;
            _this.uiCompleteCallCopy = null;
            _this.curFront = true;
            _this.curBack = false;
            _this.stopAction = false;
            _this.isClick = false;
            _this.dur = 5000;
            _this.visible = false;
            _this.SmallWallUIH.visible = false;
            _this.smallWallListH.scrollBar.hide = true;
            return _this;
        }
        YouziSmallWallH.prototype.setYouziPosition = function (x, y) {
            this.pos(x, y);
        };
        //传入UI是否创建完成通知对象
        YouziSmallWallH.prototype.setUICompleteCall = function (uiCompleteCall) {
            this.uiCompleteCallCopy = uiCompleteCall;
        };
        /**通知UI已创建完毕
         * @param uiID {界面编号}
         * @param msg {通知：是个json，方便后期能够随时增加新的信息}
         */
        YouziSmallWallH.prototype.notifyUIComplete = function (uiID, msg) {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy(uiID, msg);
            }
        };
        YouziSmallWallH.prototype.offUICompleteCall = function () {
            if (this.uiCompleteCallCopy) {
                this.uiCompleteCallCopy = null;
            }
        };
        YouziSmallWallH.prototype.onMyStart = function () {
            var isSmallWallDataOk = YouziDataModule.YouziData._isDataLoaded;
            if (isSmallWallDataOk) {
                this.initShow();
            }
            else {
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        };
        YouziSmallWallH.prototype.initShow = function () {
            if (YouziDataModule.YouziData.moreDatas.length > 0) {
                var arr = [];
                for (var i = 0; i < YouziDataModule.YouziData.moreDatas.length; i++) {
                    arr.push({
                        icon: YouziDataModule.YouziData.moreDatas[i].iconImg,
                        namelab: YouziDataModule.YouziData.moreDatas[i].title
                    });
                }
                this.smallWallListH.array = arr;
                this.smallWallListH.renderHandler = new Handler(this, this.onListRender);
                this.smallWallListH.mouseHandler = new Handler(this, this.onSmallWallListItemMouseEvent);
                this.visible = true;
                this.SmallWallUIH.visible = true;
                this.starSmallWallAction();
            }
            else {
                console.log('大家都在玩儿 没有数据');
            }
        };
        YouziSmallWallH.prototype.onListRender = function (cell, index) {
            // console.log('small index : ',index);
            // var icon:Laya.Image = cell.getChildByName('icon') as Laya.Image;
            // icon.loadImage(this.smallWallHDatas[index].iconImg);
            this.checkSendExpsureLog(index);
        };
        YouziSmallWallH.prototype.checkSendExpsureLog = function (index) {
            if (this.visible && this.SmallWallUIH.visible) {
                if (!this.smallWallHItemExposure[YouziDataModule.YouziData.moreDatas[index].appid]) {
                    // console.log('---send log moregame index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.moreDatas[index], YouziDataModule.BI_PAGE_TYPE.SMALL_MATRIX_WALL);
                    this.smallWallHItemExposure[YouziDataModule.YouziData.moreDatas[index].appid] = 1;
                }
            }
        };
        YouziSmallWallH.prototype.stopSmallWallAcion = function () {
            this.stopAction = true;
        };
        YouziSmallWallH.prototype.starSmallWallAction = function () {
            this.smallWallListAutoScroll();
        };
        YouziSmallWallH.prototype.smallWallListAutoScroll = function () {
            if (!this.SmallWallUIH.visible)
                return;
            if (this.smallWallHDatas.length <= 8) {
                return;
            }
            this.stopAction = false;
            this.dur = (this.smallWallHDatas.length - 8) * 2000;
            //当前是从前面开始向后，但是未到后面
            if (this.curFront && !this.curBack) {
                this.listTweenToEnd();
            }
            else if (!this.curFront && this.curBack) {
                this.listTweenToStart();
            }
        };
        YouziSmallWallH.prototype.listTweenToEnd = function () {
            if (!this.stopAction) {
                var endCompletHandler = new Laya.Handler(this, this.listTweenToStart, null, true);
                this.smallWallListH.tweenTo(this.smallWallHDatas.length - 1, this.dur, endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        };
        YouziSmallWallH.prototype.listTweenToStart = function () {
            if (!this.stopAction) {
                var startCompleteHandler = new Laya.Handler(this, this.listTweenToEnd, null, true);
                this.smallWallListH.tweenTo(0, this.dur, startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        };
        YouziSmallWallH.prototype.onSmallWallListItemMouseEvent = function (e, index) {
            if (e.type == 'mousedown') {
            }
            else if (e.type == 'mouseup') {
                if (!this.isClick) {
                    this.isClick = true;
                    console.log("当前选择的大家都在玩儿索引：" + index);
                    var tmpData = YouziDataModule.YouziData.moreDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.SMALL_MATRIX_WALL;
                    YouziDataModule.YouziData.startOtherGame(tmpData, this.startOtherCall.bind(this));
                    if (tmpData.hotred == 1) {
                        var tmpSlideHit = this.smallWallListH.getCell(index).getChildByName('icon').getChildByName('redhit');
                        tmpSlideHit.visible = false;
                    }
                }
            }
            else if (e.type == 'mouseover') {
            }
        };
        YouziSmallWallH.prototype.startOtherCall = function (state) {
            this.isClick = false;
            this.starSmallWallAction();
        };
        return YouziSmallWallH;
    }(ui.youzi.Youzi_SmallWallHUI));
    YouziSmallWallH_Module.YouziSmallWallH = YouziSmallWallH;
})(YouziSmallWallH_Module || (YouziSmallWallH_Module = {}));
