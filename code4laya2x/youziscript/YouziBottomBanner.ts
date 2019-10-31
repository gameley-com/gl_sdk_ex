import {ui} from  '../ui/layaMaxUI';
import {YouziData,BANNER_TYPE, BI_PAGE_TYPE, YOUZI_UI_ID} from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';
/**
 * 底部猜你喜欢
 */
export default class YouziBottomBanner extends ui.youzi.Youzi_BottomBannerUI{
    private matrixBannerDatas = [];
    private bannerType:number = BANNER_TYPE.MATRIX;
    private bannerBottomItemExposure = {};
    //false:中心化sdk控制底部猜你喜欢、底部微信banner广告和底部游戏banner推荐的显示切换；true：由游戏端子机进行控制显示和隐藏
    private isOffSwitch = false;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    private stopAction = false;
    private curFront = true;
    private curBack = false;
    private isClick = false;
    private dur = 10;

    constructor(isOffSwitch)
    {
        super();
        this.pos(Laya.stage.width/2-this.BannerBottomUI.width/2,Laya.stage.height-this.BannerBottomUI.height);
        this.visible = false;
        this.BannerBottomUI.visible = false;    
        this.bottomList.scrollBar.hide = true;
        this.isOffSwitch = isOffSwitch;
    }

    setYouziPosition(x:number,y:number)
    {
        this.pos(x,y);
    }

    //传入UI是否创建完成通知对象
    setUICompleteCall(uiCompleteCall:Function)
    {
        this.uiCompleteCallCopy = uiCompleteCall;
    }
    
    /**通知UI已创建完毕
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIComplete(uiID,msg)
    {
        if(this.uiCompleteCallCopy)
        {
            this.uiCompleteCallCopy(uiID,msg);
        }
    }

    offUICompleteCall(){
        if(this.uiCompleteCallCopy)
        {
            this.uiCompleteCallCopy = null;
        }
    }

    setUIStateCall(uiStateCall:Function)
    {
        this.uiStateCallCopy = uiStateCall;
    }
 
    /**通知UI界面状态
     * @param uiID {界面编号}
     * @param msg {通知：是个json，方便后期能够随时增加新的信息}
     */
    private notifyUIState(uiID,msg)
    {
        if(this.uiStateCallCopy)
        {
            this.uiStateCallCopy(uiID,msg);
        }
    }

    offUIStateCall(){
        if(this.uiStateCallCopy){
            this.uiStateCallCopy = null;
        }
    }

    onEnable()
    {
        var isBottomDataOk = YouziData._isDataLoaded;
        if(isBottomDataOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow()
    {
        this.matrixBannerDatas = YouziData.matrixBannerDatas;
        if(this.matrixBannerDatas.length <= 0){
            return;
        }
        this.loadBottomList();
        
        if(!this.isOffSwitch){
            YouziData.addBanner(this);
        }
    }

    loadBottomList()
    {
        var arr: Array<any> = [];
        var pRecord = null;
        for(var i:number = 0; i<this.matrixBannerDatas.length;i++){
            pRecord = this.matrixBannerDatas[i];
            if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                arr.push({icon:"",namelab:pRecord.title});
            }else{
                arr.push({icon:pRecord.iconImg,namelab:pRecord.title});
            }
        }
        this.bottomList.array = arr;
        this.bottomList.renderHandler = new Laya.Handler(this, this.onListRender);
        this.bottomList.mouseHandler = new Laya.Handler(this, this.onBannerItemMouseEvent);
        
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_BottomBanner,{complete:true});
        this.dur = this.matrixBannerDatas.length?(this.matrixBannerDatas.length-5)*5000:5000;
        this.bottomlistAutoScroll();
    }

    private onListRender(item: Laya.Box, index: number): void {
        // console.log('------->render bottombanner : ',index);
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.matrixBannerDatas[index].iconImg);
        if(this.matrixBannerDatas[index].dynamicType == 1 && this.matrixBannerDatas[index].dynamicIcon){
            var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
            imgAnima.scale(0.91,0.91);
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                this.matrixBannerDatas[index].dynamicIcon,
                // imgAnima,
                function(anima){
                    imgAnima.frames = anima.frames;
                    imgAnima.interval = anima.interval;
                    imgAnima.play();
                });
        }
        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)
    {
        if(this.visible && this.BannerBottomUI.visible)
        {
            if(!this.bannerBottomItemExposure[this.matrixBannerDatas[index].appid])
            {
                // console.log('---send log index:',index);
                YouziData.sendExposureLog(this.matrixBannerDatas[index],BI_PAGE_TYPE.MATRIX);
                this.bannerBottomItemExposure[this.matrixBannerDatas[index].appid] = 1;
            }
        }
    }

    private onBannerItemMouseEvent(e:Event,index: number): void
    {   
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true
                console.log("当前选择的bottombanner索引：" + index);
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_BottomBanner;
                var tmpData = this.matrixBannerDatas[index]
                tmpData.locationIndex = BI_PAGE_TYPE.MATRIX;
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime)
            }
        }else if(e.type == 'mouseover'){

        } 
    }

    private startOtherCall(state){
        this.isClick = false;
        this.starBottomBannerAction();
    }

    stopBottomBannerAcion()
    {
         this.stopAction = true;
    }
 
    starBottomBannerAction()
    {
        this.bottomlistAutoScroll();
    }

    private bottomlistAutoScroll()
    {

        if(this.matrixBannerDatas.length<=5){
            return
        }
        this.stopAction = false;
        
        if(this.curFront && !this.curBack){
            this.listTweenToEnd();
        }else if(!this.curFront && this.curBack){
            this.listTweenToStart();
        }
        
    }

    private listTweenToEnd()
    {
        if(!this.stopAction){
            var endCompletHandler = new Laya.Handler(this,this.listTweenToStart,null,true);
            this.bottomList.tweenTo(this.matrixBannerDatas.length-1,this.dur,endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.bottomList.tweenTo(0,this.dur,startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    showBanner()
    {
        if(this)
        {
            this.visible = true;
            this.BannerBottomUI.visible = true;
            this.notifyUIState(YOUZI_UI_ID.Youzi_BottomBanner,{uiVisible:true});
            if(this.stopAction){
                this.starBottomBannerAction();
            }
        }
    }

    hideBanner()
    {
        if(this)
        {
            this.stopBottomBannerAcion();
            this.visible = false;
            this.BannerBottomUI.visible = false;
            this.notifyUIState(YOUZI_UI_ID.Youzi_BottomBanner,{uiVisible:false});
        }
    }

    destroySelf()
    {
        if(this){
            this.removeSelf();
        }
    }

}