var YouziCenterModule;
(function (YouziCenterModule) {
    YouziCenterModule.MiniGame_Plat_Type = {
        Test: 0,
        WeChat: 1,
        OppoMiniGame: 2
    };
    var YouziCenter = /** @class */ (function () {
        function YouziCenter() {
            this.slideBtn = null;
            this.navigateToMiniCallTemp = null;
            //更多游戏UI-竖屏
            this.tempMoreGameUI = null;
            //抽屉游戏UI-竖屏
            this.tempSlideUI = null;
            this.slideWindowMask = null;
            //更多游戏UI-横屏
            this.tempMoreGameUIH = null;
            this.slideWindowMaskH = null;
            //抽屉游戏UI-横屏
            this.tempSlideUIH = null;
        }
        YouziCenter.getInstance = function () {
            if (this.instance == null) {
                this.instance = new YouziCenter();
            }
            return this.instance;
        };
        YouziCenter.prototype.youziDebug = function (debug) {
            YouziDataModule.YouziData.debug = debug;
        };
        /**
         *
         * @param appId 小游戏平台提供的appid
         * @param resVersion 中心化请求数据资源的版本号，请找我方运营
         * @param miniGamePlatType 小游戏平台类型, 请使用sdk定义好的类型 MiniGame_Plat_Type
         */
        YouziCenter.prototype.initYouzi = function (appId, resVersion, miniGamePlatType, youziAltasCall) {
            Laya.loader.load("res/atlas/youziTexture.atlas", Handler.create(null, function () {
                youziAltasCall();
                YouziDataModule.YouziData.init(appId, resVersion, miniGamePlatType);
            }));
        };
        /**
         * 设置小游戏跳转回调
         */
        YouziCenter.prototype.registerNavigateToMiniCall = function (call) {
            this.navigateToMiniCallTemp = call;
        };
        /**
         *重要：此接口只能SDK可调用
         */
        YouziCenter.prototype.notifyNavigateToMini = function (uiId) {
            if (this.navigateToMiniCallTemp) {
                this.navigateToMiniCallTemp(uiId);
            }
        };
        /**
         * 销毁跳转通知
         */
        YouziCenter.prototype.offNavigateToMimiCall = function () {
            this.navigateToMiniCallTemp = null;
        };
        /**
         * 创建更多游戏按钮
         * @param parentNode 更多游戏按钮父节点
         * @param params json{x:0,y:0,width:119,height:118，btnUrl:'youziTexture/btn-entrance-nogift.png'}};btnUrl设置按钮图片,不设置图片则使用默认
         * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
         */
        YouziCenter.prototype.createMoreGameButton = function (parentNode, params, isAutoClick) {
            var moreGameBtn = null;
            if (!params)
                params = {};
            if (params.hasOwnProperty('btnUrl')) {
                moreGameBtn = new Laya.Button(params.btnUrl);
            }
            else {
                moreGameBtn = new Laya.Button('youziTexture/btn-entrance-nogift.png');
            }
            moreGameBtn.mouseEnabled = true;
            moreGameBtn.stateNum = 1;
            moreGameBtn.width = params.hasOwnProperty('width') ? params.width : 119;
            moreGameBtn.height = params.hasOwnProperty('height') ? params.height : 119;
            var moreGameBtnX = params.hasOwnProperty('x') ? params.x : 0;
            var moreGameBtnY = params.hasOwnProperty('y') ? params.y : 0;
            moreGameBtn.pos(moreGameBtnX, moreGameBtnX);
            parentNode.addChild(moreGameBtn);
            if (isAutoClick) {
                moreGameBtn.on(Laya.Event.CLICK, this, this.showMoreGameUI);
            }
            return moreGameBtn;
        };
        YouziCenter.prototype.showMoreGameUI = function () {
            if (Laya.stage.width > Laya.stage.height) {
                if (this.tempMoreGameUIH)
                    this.tempMoreGameUIH.showMoreGameUI();
            }
            else {
                if (this.tempMoreGameUI)
                    this.tempMoreGameUI.showMoreGameUI();
            }
        };
        /**
         * 竖屏更多游戏UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createMoreGameUI = function (parentNode, params, uiStateCall) {
            var moreGameUI = new YouziMoreGame_Module.YouziMoreGame();
            // moreGameUI.setUICompleteCall(uiCompleteCall);
            moreGameUI.setUIStateCall(uiStateCall);
            if (params) {
                moreGameUI.setYouziPosition(params.x, params.y);
            }
            moreGameUI.onMyStart();
            this.tempMoreGameUI = moreGameUI;
            parentNode.addChild(moreGameUI);
            return moreGameUI;
        };
        /**
         * 横屏更多游戏UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createMoreGameUIH = function (parentNode, params, uiStateCall) {
            var moreGameUIH = new YouziMoreGameH_Module.YouziMoreGameH();
            // moreGameUIH.setUICompleteCall(uiCompleteCall);
            moreGameUIH.setUIStateCall(uiStateCall);
            if (params) {
                moreGameUIH.setYouziPosition(params.x, params.y);
            }
            moreGameUIH.onMyStart();
            this.tempMoreGameUIH = moreGameUIH;
            parentNode.addChild(moreGameUIH);
            return moreGameUIH;
        };
        /**
         * 创建抽屉按钮
         * @param parentNode 抽屉按钮父节点
         * @param params json{x:0,y:0,width:80,height:74}默认
         * @param leftOrRight true按钮在左边，false在右边
         * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
         */
        YouziCenter.prototype.createSlideButton = function (parentNode, params, leftOrRight, isAutoClick) {
            this.slideBtn = new Laya.Button('youziTexture/btn_slide.png');
            this.slideBtn.mouseEnabled = true;
            this.slideBtn.stateNum = 1;
            if (!params) {
                params = {};
            }
            this.slideBtn.width = params.hasOwnProperty('width') ? params.width : 80;
            this.slideBtn.height = params.hasOwnProperty('height') ? params.height : 74;
            var slideBtnX = 0;
            var slideBtnY = params.hasOwnProperty('y') ? params.y : Laya.stage.height / 2;
            if (leftOrRight) {
                this.slideBtn.scaleX = -1;
                slideBtnX = params.hasOwnProperty('x') ? params.x : this.slideBtn.width;
            }
            else {
                slideBtnX = params.hasOwnProperty('x') ? params.x : Laya.stage.width - this.slideBtn.width;
            }
            this.slideBtn.pos(slideBtnX, slideBtnY);
            parentNode.addChild(this.slideBtn);
            if (isAutoClick)
                this.slideBtn.on(Laya.Event.CLICK, this, this.showSlideWindowUI);
            return this.slideBtn;
        };
        YouziCenter.prototype.showSlideWindowUI = function () {
            if (Laya.stage.width > Laya.stage.height) {
                if (this.tempSlideUIH) {
                    this.tempSlideUIH.showSlideWindow();
                }
            }
            else {
                if (this.tempSlideUI) {
                    this.tempSlideUI.showSlideWindow();
                }
            }
        };
        /**
         * 竖屏抽屉UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param leftOrRight true 左边，false 右边
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createSlideWindowUI = function (parentNode, params, leftOrRight, uiStateCall) {
            var slideWindowUI = new YouziSlideWindow_Module.YouziSlideWindow(leftOrRight);
            slideWindowUI.setSlideButton(this.slideBtn);
            slideWindowUI.setSlideMask(this.createSlideWindowMask());
            // slideWindowUI.setUICompleteCall(uiCompleteCall);
            slideWindowUI.setUIStateCall(uiStateCall);
            if (params) {
                slideWindowUI.setYouziPosition(params.y);
            }
            this.tempSlideUI = slideWindowUI;
            slideWindowUI.onMyStart();
            parentNode.addChild(this.createSlideWindowMask());
            parentNode.addChild(slideWindowUI);
            return slideWindowUI;
        };
        /**
         * 创建抽屉遮罩并不允许点击透过,节点应位于抽屉上面既绘制时在抽屉下面
         */
        YouziCenter.prototype.createSlideWindowMask = function () {
            if (this.slideWindowMask) {
                return this.slideWindowMask;
            }
            else {
                this.slideWindowMask = new Laya.Button('youziTexture/blank.png');
                this.slideWindowMask.width = 1000;
                this.slideWindowMask.height = 1900;
                this.slideWindowMask.stateNum = 1;
                this.slideWindowMask.centerX = 0;
                this.slideWindowMask.centerY = 0;
                this.slideWindowMask.visible = false;
                return this.slideWindowMask;
            }
        };
        /**
         * 横屏屏抽屉UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param leftOrRight true 左边，false 右边
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createSlideWindowUIH = function (parentNode, params, leftOrRight, uiStateCall) {
            var slideWindowUIH = new YouziSlideWindowH_Module.YouziSlideWindowH(leftOrRight);
            slideWindowUIH.setSlideButton(this.slideBtn);
            slideWindowUIH.setSlideMask(this.createSlideWindowMaskH());
            // slideWindowUIH.setUICompleteCall(uiCompleteCall);
            slideWindowUIH.setUIStateCall(uiStateCall);
            if (params) {
                slideWindowUIH.setYouziPosition(params.y);
            }
            this.tempSlideUIH = slideWindowUIH;
            slideWindowUIH.onMyStart();
            parentNode.addChild(this.createSlideWindowMaskH());
            parentNode.addChild(slideWindowUIH);
            return slideWindowUIH;
        };
        /**
         * 创建抽屉遮罩并不允许点击透过,节点应位于抽屉上面既绘制时在抽屉下面
         */
        YouziCenter.prototype.createSlideWindowMaskH = function () {
            if (this.slideWindowMaskH) {
                return this.slideWindowMaskH;
            }
            else {
                this.slideWindowMaskH = new Laya.Button('youziTexture/blank.png');
                this.slideWindowMaskH.width = 1900;
                this.slideWindowMaskH.height = 1000;
                this.slideWindowMaskH.centerX = 0;
                this.slideWindowMaskH.centerY = 0;
                this.slideWindowMaskH.stateNum = 1;
                this.slideWindowMaskH.visible = false;
                return this.slideWindowMaskH;
            }
        };
        /**
         * 底部推荐UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
         */
        YouziCenter.prototype.createBottomBanner = function (parentNode, params, isOffSwich) {
            var bottomBanner = new YouziBottomBanner_Module.YouziBottomBanner(isOffSwich);
            // bottomBanner.setUICompleteCall(uiCompleteCall);
            if (params) {
                bottomBanner.setYouziPosition(params.x, params.y);
            }
            bottomBanner.onMyStart();
            parentNode.addChild(bottomBanner);
            return bottomBanner;
        };
        /**
         * 停止或者启动猜你喜欢List的tweento滚动列表
         * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
         * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
         * @param startOrStop boolen值，false为启动，true为停止
         * @param bottomBannerTemp 游戏创建竖屏猜你喜欢对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
         *
         */
        YouziCenter.prototype.bottomBannerActionStopOrStart = function (startOrStop, bottomBannerTemp) {
            if (bottomBannerTemp) {
                if (startOrStop) {
                    bottomBannerTemp.stopBottomBannerAcion();
                }
                else {
                    bottomBannerTemp.starBottomBannerAction();
                }
            }
        };
        /**
         * 横向猜你喜欢UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createGuessLike = function (parentNode, params) {
            var guessLike = new YouziGuessLike_Module.YouziGuessLike();
            // guessLike.setUICompleteCall(uiCompleteCall);
            if (params) {
                guessLike.setYouziPosition(params.x, params.y);
            }
            guessLike.onMyStart();
            parentNode.addChild(guessLike);
            return guessLike;
        };
        /**
         * 竖向猜你喜欢UI
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createGuessLikeH = function (parentNode, params) {
            var guessLikeH = new YouziGuessLikeH_Module.YouziGuessLikeH();
            // guessLikeH.setUICompleteCall(uiCompleteCall);
            if (params) {
                guessLikeH.setYouziPosition(params.x, params.y);
            }
            guessLikeH.onMyStart();
            parentNode.addChild(guessLikeH);
            return guessLikeH;
        };
        /**
         * 停止或者启动猜你喜欢List的tweento滚动列表
         * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
         * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
         * @param startOrStop boolen值，false为启动，true为停止
         * @param guessLikeTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
         * @param guessLikeHTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
         */
        YouziCenter.prototype.guessLikeListTweenStopOrStart = function (stopOrStart, guessLikeTemp, guessLikeHTemp) {
            if (guessLikeTemp) {
                if (stopOrStart) {
                    guessLikeTemp.stopGuessLikeAcion();
                }
                else {
                    guessLikeTemp.starGuessLikeAction();
                }
            }
            if (guessLikeHTemp) {
                if (stopOrStart) {
                    guessLikeHTemp.stopGuessLikeHAcion();
                }
                else {
                    guessLikeHTemp.starGuessLikeHAction();
                }
            }
        };
        /**
         * 主推
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createMainPush = function (parentNode, params) {
            var mainPush = new YouziMainPush_Module.YouziMainPush();
            // mainPush.setUICompleteCall(uiCompleteCall);
            if (params) {
                mainPush.setYouziPosition(params.x, params.y);
            }
            mainPush.onMyStart();
            parentNode.addChild(mainPush);
            return mainPush;
        };
        /**
         * 停止或者启动主推动画和循环切换主推内容
         * 1、主推创建时默认启动动画
         * @param stopOrStart boolen值，false为启动，true为停止
         * @param mainPushTemp 创建的主推对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
         */
        YouziCenter.prototype.mainPushActionStopOrStart = function (stopOrStart, mainPushTemp) {
            if (stopOrStart) {
                mainPushTemp.clearTimerLoop();
            }
            else {
                mainPushTemp.startTimerLoop();
            }
        };
        /**
     *
     * @param paramsJsonArray json数组,当前界面最多可以摆放的主推数组
     *  格式：[{parentNode:node,x:0,y:0}],parentNode:主推父节点，x，y为主推节点坐标
     */
        YouziCenter.prototype.createMultiMainPush = function (paramsJsonArray) {
            var youziMultiMainPushManager = new YouziMultipleMainPushManager_Module.YouziMultipleMainPushManager(paramsJsonArray);
            return youziMultiMainPushManager;
        };
        /**
         * 停止或者启动多主推动画和循环切换主推内容
         * 1、主推创建时默认启动动画
         * @param stopOrStart boolen值，false为启动，true为停止
         * @param multiMainPushManager 多主推管理对象
         */
        YouziCenter.prototype.stopOrStartMultiMainPush = function (stopOrStart, multiMainPushManager) {
            if (!multiMainPushManager)
                return;
            if (stopOrStart) {
                multiMainPushManager.stopChangeTimeLoop();
            }
            else {
                multiMainPushManager.startChangeTimeLoop();
            }
        };
        /**
         * 竖屏离线推荐
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createOffline = function (parentNode, params, uiStateCall) {
            var offlineUI = new YouziOffLine_Module.YouziOffLine();
            // offlineUI.setUICompleteCall(uiCompleteCall);
            offlineUI.setUIStateCall(uiStateCall);
            if (params) {
                offlineUI.setYouziPosition(params.x, params.y);
            }
            offlineUI.onMyStart();
            parentNode.addChild(offlineUI);
            return offlineUI;
        };
        /**
         * 横屏离线推荐
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         * @param uiStateCall ui显示和隐藏回调
         */
        YouziCenter.prototype.createOfflineH = function (parentNode, params, uiStateCall) {
            var offlineUIH = new YouziOffLineH_Module.YouziOffLineH();
            // offlineUIH.setUICompleteCall(uiCompleteCall);
            offlineUIH.setUIStateCall(uiStateCall);
            if (params) {
                offlineUIH.setYouziPosition(params.x, params.y);
            }
            offlineUIH.onMyStart();
            parentNode.addChild(offlineUIH);
            return offlineUIH;
        };
        /**
         * 微信banner广告
         * @param {string} wechatBannerID 微信banner广告id
         * @param {} posType
         * @param {} offset
         * @param {} isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
         * @param {} isOffSwitchSelf
         */
        YouziCenter.prototype.createYouzi_WechatBanner = function (wechatBannerID, posType, offset, isOffSwich, isOffSwitchSelf) {
            if (posType === void 0) { posType = null; }
            if (offset === void 0) { offset = null; }
            if (isOffSwich === void 0) { isOffSwich = false; }
            if (isOffSwitchSelf === void 0) { isOffSwitchSelf = false; }
            var youziWechatBanner = new YouziWeChatBanner_Module.YouziWeChatBanner(wechatBannerID, posType, offset, isOffSwich, isOffSwitchSelf);
            return youziWechatBanner;
        };
        /**
         *
         * @param {boolean} isOffSwitch false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
         * @param {number} switchTime 微信banner广告是否自动更换。true交由中心化sdk调用switchBannerNow进行更换自身显示的内容
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createYouzi_GameBanner = function (isOffSwitch, switchTime, params) {
            var youziGameBanner = new YouziGameBanner_Module.YouziGameBanner(isOffSwitch, switchTime);
            if (params)
                youziGameBanner.setYouziPosition(params.x, params.y);
            youziGameBanner.onMyStart();
            return youziGameBanner;
        };
        /**
         * 大家都在玩儿竖屏,注意不显示时请隐藏父节点
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createYouziSmallWall = function (parentNode, params) {
            var youziSmallWall = new YouziSmallWall_Module.YouziSmallWall();
            // youziSmallWall.setUICompleteCall(uiCompleteCall);
            if (params)
                youziSmallWall.setYouziPosition(params.x, params.y);
            youziSmallWall.onMyStart();
            parentNode.addChild(youziSmallWall);
            return youziSmallWall;
        };
        /**
         * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
         * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
         * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
         * @param startOrStop boolen值，false为启动，true为停止
         * @param smallWallTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
         *
         */
        YouziCenter.prototype.smallWallActionStopOrStart = function (startOrStop, smallWallTemp) {
            if (smallWallTemp) {
                if (startOrStop) {
                    smallWallTemp.stopSmallWallAcion();
                }
                else {
                    smallWallTemp.starSmallWallAction();
                }
            }
        };
        /**
         * 大家都在玩儿横屏,注意不显示时请隐藏父节点
         * @param parentNode UI的父节点
         * @param params 传入json，{x:0,y:0},默认请传null
         */
        YouziCenter.prototype.createYouziSmallWallH = function (parentNode, params) {
            var youziSmallWallH = new YouziSmallWallH_Module.YouziSmallWallH();
            // youziSmallWallH.setUICompleteCall(uiCompleteCall);
            if (params)
                youziSmallWallH.setYouziPosition(params.x, params.y);
            youziSmallWallH.onMyStart();
            parentNode.addChild(youziSmallWallH);
            return youziSmallWallH;
        };
        /**
         * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
         * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
         * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
         * @param startOrStop boolen值，false为启动，true为停止
         * @param smallWallHTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
         *
         */
        YouziCenter.prototype.smallWallHActionStopOrStart = function (startOrStop, smallWallHTemp) {
            if (smallWallHTemp) {
                if (startOrStop) {
                    smallWallHTemp.stopSmallWallAcion();
                }
                else {
                    smallWallHTemp.starSmallWallAction();
                }
            }
        };
        /**
         *
         * @param parentNode 落地页父节点：盒子需要在第一个场景创建落地页，并且在没有回调通知进入游戏时，不可以读取下一个场景
         * @param wxLaunch 传入wx.getLaunchOptionsSync()返回的对象
         * @param enterGameCall 通知可以进入游戏的回调
         */
        YouziCenter.prototype.createScreenPage = function (parentNode, wxLaunch, enterGameCall) {
            var youziScreenPage = new YouziScreenPage_Module.YouziScreenPage(wxLaunch);
            youziScreenPage.registerGoToGameListen(enterGameCall);
            youziScreenPage.onMyStart();
            parentNode.addChild(youziScreenPage);
            return youziScreenPage;
        };
        YouziCenter.instance = null;
        return YouziCenter;
    }());
    YouziCenterModule.YouziCenter = YouziCenter;
})(YouziCenterModule || (YouziCenterModule = {}));
