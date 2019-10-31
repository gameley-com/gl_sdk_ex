//必要
import { YouziData,YOUZI_UI_ID } from "./YouziData";
import YouziMainPush from "./YouziMainPush";
import YouziBottomBanner from "./YouziBottomBanner";
import YouziWeChatBanner from "./YouziWeChatBanner";
import YouziGameBanner from "./YouziGameBanner";

//横屏
import YouziMoreGame from "./YouziMoreGame";
import YouziSlideWindow from "./YouziSlideWindow";
import YouziGuessLike from "./YouziGuessLike";
import YouziSmallWall from "./YouziSmallWall";
import YouziOffLine from "./YouziOffLine";

//竖屏
import YouziGuessLikeH from "./YouziGuessLikeH";
import YouziMoreGameH from "./YouziMoreGameH";
import YouziOffLineH from "./YouziOffLineH";
import YouziSlideWindowH from "./YouziSlideWindowH";
import YouziSmallWallH from "./YouziSmallWallH";
import YouziMultipleMainPushManager from "./YouziMultipleMainPushManager";
import YouziFullMatrixScreen from "./YouziFullMatrixScreen";
import YouziFullMatrixScreenH from "./YouziFullMatrixScreenH";

export const MiniGame_Plat_Type = {
    Test:0,
    WeChat:1,
    OppoMiniGame:2
}

export default class YouziCenter {
    public static instance:YouziCenter = null;
    private navigateToMiniCallTemp:Array<Function> = [];
    private slideBtn:Laya.Button = null;
    private multiMainPushAmount = 1;
    private fullScreenMatrixNode:Laya.Node = null;
    private fullScreenMatrix:YouziFullMatrixScreen = null;
    private fullScreenMatrixH:YouziFullMatrixScreenH = null;
    private vertical = true;//false 竖屏
    //主推
    // private mainPush:YouziMainPush = null;
    //底部推荐
    // private bottomBanner:YouziBottomBanner = null;
    //底部游戏banner
    // private youziGameBanner:YouziGameBanner = null;
    //猜你喜欢-竖屏
    // private guessLike:YouziGuessLike = null;  
    // 更多游戏UI-竖屏
    private moreGameUI:YouziMoreGame = null;
    //抽屉游戏UI-竖屏
    private slideWindowUI:YouziSlideWindow = null;
    private slideWindowMask:Laya.Button = null;
    //离线-竖屏
    // private offlineUI:YouziOffLine = null;
    //大家都在玩儿-竖屏
    // private youziSmallWall:YouziSmallWall = null;

    //猜你喜欢-横屏
    // private guessLikeH:YouziGuessLikeH = null;
    //更多游戏UI-横屏
    private moreGameUIH:YouziMoreGameH = null;
    //抽屉游戏UI-横屏
    private slideWindowUIH:YouziSlideWindowH = null;
    private slideWindowMaskH:Laya.Button = null;
    //离线-横屏
    // private offlineUIH:YouziOffLineH = null;
    //大家都在玩儿-横屏
    // private youziSmallWallH:YouziSmallWallH = null;

    public static getInstance(){
        if(this.instance == null){
            this.instance = new YouziCenter();
        }
        return this.instance

    }

    public youziDebug(debug:boolean)
    {
        YouziData.debug = debug;
    }
    /**
     * 
     * @param appId 小游戏平台提供的appid
     * @param resVersion 中心化请求数据资源的版本号，请找我方运营
     * @param miniGamePlatType 小游戏平台类型, 请使用sdk定义好的类型 MiniGame_Plat_Type
     */
    public initYouzi(appId:string,resVersion:string,miniGamePlatType:number){
        YouziData.init(appId, resVersion, miniGamePlatType);
        if(Laya.stage.width>Laya.stage.height)
                this.vertical = false;
        
    }

    /**
     * 设置小游戏跳转回调
     */
    public registerNavigateToMiniCall(call:Function)
    {
        this.navigateToMiniCallTemp.push(call);
    }

    /**
     *重要：此接口只能SDK可调用
     */
    public notifyNavigateToMini(uiId:number){
        if(this.navigateToMiniCallTemp.length>0){
            this.navigateToMiniCallTemp.forEach(function(call){
                call(uiId);
            });
        }
    }

    /**
     * 销毁跳转通知
     */
    public offNavigateToMimiCall(){
        this.navigateToMiniCallTemp = null;
    }

    /**
     * 创建更多游戏按钮
     * @param parentNode 更多游戏按钮父节点
     * @param params json{x:0,y:0,width:0,height:0,btnUrl:'youziTexture/btn-entrance-nogift.png'} btnUrl设置按钮图片
     * @param btnUrl 自定义
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     */
    public createMoreGameButton(parentNode,params,isAutoClick){
        var moreGameBtn:Laya.Button = null;
        if (!params)
                params = {};
        if (params.hasOwnProperty('btnUrl')) {
            moreGameBtn = new Laya.Button(params.btnUrl);
        }else{
            moreGameBtn = new Laya.Button('youziTexture/btn-entrance-nogift.png');
        }
        moreGameBtn.mouseEnabled = true;
        moreGameBtn.stateNum = 1;
        moreGameBtn.width = params.hasOwnProperty('width') ? params.width : 119;
        moreGameBtn.height = params.hasOwnProperty('height') ? params.height : 119;
        var moreGameBtnX = params.hasOwnProperty('x') ? params.x : 0;
        var moreGameBtnY = params.hasOwnProperty('y') ? params.y : 0;
        moreGameBtn.pos(moreGameBtnX,moreGameBtnY);
        parentNode.addChild(moreGameBtn);
        if(isAutoClick){
            moreGameBtn.on(Laya.Event.CLICK,this,this.showMoreGameUI);
        }
        return moreGameBtn;
    }

    private showMoreGameUI(){
        if(Laya.stage.width>Laya.stage.height){
            if(this.moreGameUIH)
                this.moreGameUIH.showMoreGameUI();
        }else{
            if(this.moreGameUI)
                this.moreGameUI.showMoreGameUI();
        }
    }

    /**
     * 竖屏更多游戏UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param uiStateCall ui显示和隐藏回调
     */
    public createMoreGameUI(parentNode,params,uiStateCall?:Function){
        this.moreGameUI = new YouziMoreGame();
        // this.moreGameUI.setUICompleteCall(uiCompleteCall);
        this.moreGameUI.setUIStateCall(uiStateCall);
        if(params){
            this.moreGameUI.setYouziPosition(params.x,params.y);  
        }
        // this.moreGameUI.onMyStart();
        parentNode.addChild(this.moreGameUI);
        return this.moreGameUI;
    }

    /**
     * 横屏更多游戏UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param uiStateCall ui显示和隐藏回调
     */
    public createMoreGameUIH(parentNode,params,uiStateCall?:Function){
        this.moreGameUIH = new YouziMoreGameH();
        // this.moreGameUIH.setUICompleteCall(uiCompleteCall);
        this.moreGameUIH.setUIStateCall(uiStateCall);
        if(params){
            this.moreGameUIH.setYouziPosition(params.x,params.y);
        }
        // this.moreGameUIH.onMyStart();
        parentNode.addChild(this.moreGameUIH);
        return this.moreGameUIH;
    }

    /**
     * 创建抽屉按钮
     * @param parentNode 抽屉按钮父节点
     * @param params json{x:0,y:0,width:0,height:0}
     * @param leftOrRight true按钮在左边，false在右边
     * @param isAutoClick 是否有sdk自动完成点击注册,true交给sdk注册，false则开发者自行注册
     */
    public createSlideButton(parentNode,params,leftOrRight,isAutoClick){
        this.slideBtn = new Laya.Button('youziTexture/btn_slide.png');
        this.slideBtn.mouseEnabled = true;
        this.slideBtn.stateNum = 1;
        if (!params) {
            params = {};
        }
                   
        this.slideBtn.width = params.width;
        this.slideBtn.height = params.height;
        var slideBtnX = 0;
        var slideBtnY = params.hasOwnProperty('y') ? params.y : Laya.stage.height / 2;
        if(leftOrRight){
            this.slideBtn.scaleX = -1;
            slideBtnX = params.hasOwnProperty('x') ? params.x : this.slideBtn.width;
        }else{
            slideBtnX = params.hasOwnProperty('x') ? params.x : Laya.stage.width - this.slideBtn.width;
        }
        this.slideBtn.pos(slideBtnX, slideBtnY);
        parentNode.addChild(this.slideBtn);
        if(isAutoClick)
            this.slideBtn.on(Laya.Event.CLICK,this,this.showSlideWindowUI);
        return this.slideBtn;
    }

    private showSlideWindowUI(){
        if(Laya.stage.width > Laya.stage.height){
            if(this.slideWindowUIH)
            {
                this.slideWindowUIH.showSlideWindow();
            }
                
        }else{
            if(this.slideWindowUI)
            {
                this.slideWindowUI.showSlideWindow();
            }      
        }
    }

    /**
     * 竖屏抽屉UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param leftOrRight true 左边，false 右边
     * @param uiStateCall ui显示和隐藏回调
     */
    public createSlideWindowUI(parentNode,params,leftOrRight,uiStateCall?:Function){

        this.slideWindowUI = new YouziSlideWindow(leftOrRight);
        this.slideWindowUI.setSlideButton(this.slideBtn);
        this.slideWindowUI.setSlideMask(this.createSlideWindowMask());
        // this.slideWindowUI.setUICompleteCall(uiCompleteCall);
        this.slideWindowUI.setUIStateCall(uiStateCall);
        if(params){
            this.slideWindowUI.setYouziPosition(params.y);
        }
        // this.slideWindowUI.onMyStart();
        parentNode.addChild(this.createSlideWindowMask());
        parentNode.addChild(this.slideWindowUI);
        return this.slideWindowUI;
    }
    /**
     * 创建抽屉遮罩并不允许点击透过,节点应位于抽屉上面既绘制时在抽屉下面
     */
    private createSlideWindowMask(){
        if(this.slideWindowMask){
            return this.slideWindowMask;
        }else{
            this.slideWindowMask = new Laya.Button('youziTexture/blank.png');
            this.slideWindowMask.width = 1000;
            this.slideWindowMask.height = 1900;
            this.slideWindowMask.stateNum = 1;
            this.slideWindowMask.centerX = 0;
            this.slideWindowMask.centerY = 0;
            this.slideWindowMask.visible = false;
            return this.slideWindowMask;
        }
        
    }

    /**
     * 横屏屏抽屉UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param leftOrRight true 左边，false 右边
     * @param uiStateCall ui显示和隐藏回调
     */
    public createSlideWindowUIH(parentNode,params,leftOrRight,uiStateCall?:Function){
        this.slideWindowUIH = new YouziSlideWindowH(leftOrRight);
        this.slideWindowUIH.setSlideButton(this.slideBtn);
        this.slideWindowUIH.setSlideMask(this.createSlideWindowMaskH());
        // this.slideWindowUIH.setUICompleteCall(uiCompleteCall);
        this.slideWindowUIH.setUIStateCall(uiStateCall);
        if(params){
            this.slideWindowUIH.setYouziPosition(params.y);
        }
        // this.slideWindowUIH.onMyStart();
        parentNode.addChild(this.createSlideWindowMaskH());
        parentNode.addChild(this.slideWindowUIH);
        return this.slideWindowUIH;
    }

    /**
     * 创建抽屉遮罩并不允许点击透过,节点应位于抽屉上面既绘制时在抽屉下面
     */
    private createSlideWindowMaskH(){
        if(this.slideWindowMaskH){
            return this.slideWindowMaskH;
        }else{
            this.slideWindowMaskH = new Laya.Button('youziTexture/blank.png');
            this.slideWindowMaskH.width = 1900;
            this.slideWindowMaskH.height = 1000;
            this.slideWindowMaskH.centerX = 0;
            this.slideWindowMaskH.centerY = 0;
            this.slideWindowMaskH.stateNum = 1;
            this.slideWindowMaskH.visible = false;
            return this.slideWindowMaskH;
        }
        
    }

    /**
     * 底部推荐UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     */
    public createBottomBanner(parentNode,params,isOffSwich){
        var bottomBanner = new YouziBottomBanner(isOffSwich);
        // bottomBanner.setUICompleteCall(uiCompleteCall);
        if(params){
            bottomBanner.setYouziPosition(params.x,params.y);
        }
        // this.bottomBanner.onMyStart();
        parentNode.addChild(bottomBanner);
        return bottomBanner;
    }
    
    /**
     * 停止或者启动猜你喜欢List的tweento滚动列表
     * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param bottomBannerTemp 游戏创建竖屏猜你喜欢对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     * 
     */
    public bottomBannerActionStopOrStart(startOrStop,bottomBannerTemp:YouziBottomBanner)
    {
        if(bottomBannerTemp){
            if(startOrStop){
                bottomBannerTemp.stopBottomBannerAcion();
            }else{
                bottomBannerTemp.starBottomBannerAction();
            }
        }
    }


    /**
     * 横向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createGuessLike(parentNode,params){
        var guessLike = new YouziGuessLike();
        // guessLike.setUICompleteCall(uiCompleteCall);
        if(params){
            guessLike.setYouziPosition(params.x,params.y);
        }
        // this.guessLike.onMyStart();
        parentNode.addChild(guessLike);
        return guessLike;
    }

    /**
     * 竖向猜你喜欢UI
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createGuessLikeH(parentNode,params){
        var guessLikeH = new YouziGuessLikeH();
        // guessLikeH.setUICompleteCall(uiCompleteCall);
        if(params){
            guessLikeH.setYouziPosition(params.x,params.y)
        }
        // this.guessLikeH.onMyStart();
        parentNode.addChild(guessLikeH);
        return guessLikeH;
    }

    /**
     * 停止或者启动猜你喜欢List的tweento滚动列表
     * 1、如果猜你喜欢界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏猜你喜欢并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param guessLikeTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     * @param guessLikeHTemp 游戏创建竖屏猜你喜欢对象，没有传null，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     */
    public guessLikeListTweenStopOrStart(stopOrStart,guessLikeTemp:YouziGuessLike,guessLikeHTemp:YouziGuessLikeH)
    {
        
        if(guessLikeTemp)
        {
            if(stopOrStart){
                guessLikeTemp.stopGuessLikeAcion();
            }else{
                guessLikeTemp.starGuessLikeAction();
            }
        }
        
        if(guessLikeHTemp)
        {
            if(stopOrStart){
                guessLikeHTemp.stopGuessLikeHAcion();
            }else{
                guessLikeHTemp.starGuessLikeHAction();
            }
        }
        
    }

    /**
     * 主推
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createMainPush(parentNode,params){
        var mainPush = new YouziMainPush();
        // mainPush.setUICompleteCall(uiCompleteCall);
        if(params){
            mainPush.setYouziPosition(params.x,params.y);
        }
        // this.mainPush.onMyStart();
        parentNode.addChild(mainPush);
        return mainPush;
    }

    /**
     * 停止或者启动主推动画和循环切换主推内容
     * 1、主推创建时默认启动动画
     * @param stopOrStart boolen值，false为启动，true为停止
     * @param mainPushTemp 创建的主推对象，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建
     */
    public mainPushActionStopOrStart(stopOrStart,mainPushTemp:YouziMainPush)
    {
        if(stopOrStart)
        {
            mainPushTemp.clearTimerLoop();
        }else{
            mainPushTemp.startTimerLoop();
        }
    }

    /**
     * 
     * @param paramsJsonArray json数组,当前界面最多可以摆放的主推数组
     *  格式：[{parentNode:node,x:0,y:0}],parentNode:主推父节点，x，y为主推节点坐标
     */
    public createMultiMainPush(paramsJsonArray:Array<any>)
    {
        var youziMultiMainPushManager:YouziMultipleMainPushManager = new YouziMultipleMainPushManager(paramsJsonArray);
        return youziMultiMainPushManager;
    }

    /**
     * 停止或者启动多主推动画和循环切换主推内容
     * 1、主推创建时默认启动动画
     * @param stopOrStart boolen值，false为启动，true为停止
     * @param multiMainPushManager 多主推管理对象
     */
    public stopOrStartMultiMainPush(stopOrStart,multiMainPushManager:YouziMultipleMainPushManager)
    {
        if(!multiMainPushManager)
            return;
        if(stopOrStart){
            multiMainPushManager.stopChangeTimeLoop();
        }else{
            multiMainPushManager.startChangeTimeLoop();
        }
    }

    /**
     * 竖屏离线推荐
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param uiStateCall ui显示和隐藏回调 
     */
    public createOffline(parentNode,params,uiStateCall?:Function){
        var offlineUI = new YouziOffLine();
        // offlineUI.setUICompleteCall(uiCompleteCall);
        offlineUI.setUIStateCall(uiStateCall);
        if(params){
            offlineUI.setYouziPosition(params.x,params.y);
        }
        // this.offlineUI.onMyStart();
        parentNode.addChild(offlineUI);
        return offlineUI;
    }

    /**
     * 横屏离线推荐
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     * @param uiStateCall ui显示和隐藏回调 
     */
    public createOfflineH(parentNode,params,uiStateCall?:Function){
        var offlineUIH = new YouziOffLineH();
        // offlineUIH.setUICompleteCall(uiCompleteCall);
        offlineUIH.setUIStateCall(uiStateCall);
        if(params){
            offlineUIH.setYouziPosition(params.x,params.y);
        }
        // this.offlineUIH.onMyStart();
        parentNode.addChild(offlineUIH);
        return offlineUIH;
    }

    /**
     * 微信banner广告
     * @param {string} wechatBannerID 微信banner广告id 
     * @param {} posType 
     * @param {} offset 
     * @param {} isOffSwich false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     * @param {} isOffSwitchSelf 
     */
    public createYouzi_WechatBanner(wechatBannerID,posType=null,offset=null,isOffSwich=false,isOffSwitchSelf=false){
        var youziWechatBanner:YouziWeChatBanner = new YouziWeChatBanner(wechatBannerID,posType,offset,isOffSwich,isOffSwitchSelf);
        return youziWechatBanner;
    }

    /**
     * 
     * @param {boolean} isOffSwitch false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
     * @param {number} switchTime 微信banner广告是否自动更换。true交由中心化sdk调用switchBannerNow进行更换自身显示的内容
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createYouzi_GameBanner(isOffSwitch,switchTime,params)
    {
        var youziGameBanner = new YouziGameBanner(isOffSwitch,switchTime);
        if(params){
            youziGameBanner.setYouziPosition(params.x,params.y);
        }
        // this.youziGameBanner.onMyStart();
        return youziGameBanner;
    }

    /**
     * 小矩阵墙竖屏,注意不显示时请隐藏父节点
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createYouziSmallWall(parentNode,params)
    {
        var youziSmallWall = new YouziSmallWall();
        // youziSmallWall.setUICompleteCall(uiCompleteCall);
        if(params){
            youziSmallWall.setYouziPosition(params.x,params.y);
        }
        // this.youziSmallWall.onMyStart();
        parentNode.addChild(youziSmallWall);
        return youziSmallWall;
    }

     /**
     * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
     * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param smallWallTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
     * 
     */
    public smallWallActionStopOrStart(startOrStop,smallWallTemp:YouziSmallWall)
    {
        if(smallWallTemp){
            if(startOrStop){
                smallWallTemp.stopSmallWallAcion();
            }else{
                smallWallTemp.starSmallWallAction();
            }
        }
    }

    /**
     * 大家都在玩儿横屏,注意不显示时请隐藏父节点
     * @param parentNode UI的父节点
     * @param params 传入json，{x:0,y:0},默认请传null
     */
    public createYouziSmallWallH(parentNode,params)
    {
        var youziSmallWallH = new YouziSmallWallH();
        // youziSmallWallH.setUICompleteCall(uiCompleteCall);
        if(params){
            youziSmallWallH.setYouziPosition(params.x,params.y);
        }
        // this.youziSmallWallH.onMyStart();
        parentNode.addChild(youziSmallWallH);
        return youziSmallWallH;
    }

    /**
     * 停止或者启动小矩阵墙竖屏List的tweento滚动列表
     * 1、如果小矩阵墙界面是重新创建的停止后可以不调用，创建时默认是启动滚动列表的
     * 2、当隐藏小矩阵墙竖屏并停止滚动列表并非是真的停止，列表回最后一次滚动到第一个或者最后一个才真正停止
     * @param startOrStop boolen值，false为启动，true为停止
     * @param smallWallHTemp 游戏创建的小矩阵墙竖屏，由于可能会创建多个，但是sdk不保存，所以需要传入游戏创建的
     * 
     */
    public smallWallHActionStopOrStart(startOrStop,smallWallHTemp:YouziSmallWallH)
    {
        if(smallWallHTemp){
            if(startOrStop){
                smallWallHTemp.stopSmallWallAcion();
            }else{
                smallWallHTemp.starSmallWallAction();
            }
        }
    }
    
    /**
     * 展示全屏落地页矩阵
     */
    public showFullScreenMatrix(){
        if(this.fullScreenMatrixNode){
            if(this.vertical){
                this.fullScreenMatrix.showFullScreen();
            }else{
                this.fullScreenMatrixH.showFullScreen();
            }
        }else{
            if(this.vertical){
                this.fullScreenMatrix = new YouziFullMatrixScreen();
                this.fullScreenMatrixNode = Laya.stage.addChild(this.fullScreenMatrix)  
                this.fullScreenMatrix.showFullScreen();   
            }else{
                this.fullScreenMatrixH = new YouziFullMatrixScreenH();
                this.fullScreenMatrixNode = Laya.stage.addChild(this.fullScreenMatrixH)     
                this.fullScreenMatrixH.showFullScreen();
            }
        }
    }


}