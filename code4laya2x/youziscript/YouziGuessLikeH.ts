import {ui} from  '../ui/layaMaxUI'
import { YouziData, BI_PAGE_TYPE, YOUZI_UI_ID } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziGuessLikeH extends ui.youzi.Youzi_GuessLikeHUI{

    private matrixBannerDatas = [];
    private guessAnyItemExposure = {};
    private firstShow = false;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;

    constructor(){
        super();
        this.visible = false;
        this.guessUI.visible = false;
        this.guesslist.scrollBar.hide = true
    }

    setYouziPosition(x:number,y:number){
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

    onEnable(){
        var guessLikeDataOk = YouziData._isDataLoaded;
        if(guessLikeDataOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    // showGuessLikeView(){
    //     if(!this.firstShow){
    //         this.firstShow = true;
    //         this.checkExposure();
    //     }
    //     this.visible = true;
    //     this.guessUI.visible = true;
    //     this.guessAnylistAutoScroll();
    // }

    // hideGuessLikeView(){
    //     this.visible = false;
    //     this.guessUI.visible = false; 
    // }

    initShow(){
        this.matrixBannerDatas = YouziData.matrixBannerDatas;
        var arr: Array<any> = [];
        var pRecord = null;
		for (var i: number = 0; i < this.matrixBannerDatas.length; i++) {
            pRecord = this.matrixBannerDatas[i];
            if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                arr.push({icon:"",namelab:pRecord.title});
            }else{
                arr.push({icon:pRecord.iconImg,namelab:pRecord.title});
            }
		}

        this.guesslist.array = arr;
        this.guesslist.renderHandler = new Laya.Handler(this,this.onListRender);
        this.guesslist.mouseHandler = new Laya.Handler(this, this.onGuessLikeItemMouseEvent);

        this.visible = true;
        this.guessUI.visible = true;
        this.notifyUIComplete(YOUZI_UI_ID.Youzi_GuessLikeH,{complete:true});
        this.notifyUIState(YOUZI_UI_ID.Youzi_GuessLikeH,{uiVisible:true});
        this.dur = this.matrixBannerDatas.length>5?(this.matrixBannerDatas.length-5)*5000:5000;
        this.guessAnylistHAutoScroll();
    }

    private onListRender(item:Laya.Box,index:number):void
    {
        // console.log('------->render guesslikeh : ',index);
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.matrixBannerDatas[index].iconImg);
        if(this.matrixBannerDatas[index].dynamicType == 1 && this.matrixBannerDatas[index].dynamicIcon){
            var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
            imgAnima.scale(0.75,0.75);
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
        if(this.visible && this.guessUI.visible)
        {
            if(!this.guessAnyItemExposure[this.matrixBannerDatas[index].appid])
            {
                // console.log('---send log index:',index);
                YouziData.sendExposureLog(this.matrixBannerDatas[index],BI_PAGE_TYPE.GUESS);
                this.guessAnyItemExposure[this.matrixBannerDatas[index].appid] = 1;
            }
        }
    }

    stopGuessLikeHAcion()
    {
        this.stopAction = true;
    }

    starGuessLikeHAction()
    {
        this.guessAnylistHAutoScroll();
    }

    private guessAnylistHAutoScroll()
    {
        if(!this.guessUI.visible)
            return;
        if(this.matrixBannerDatas.length<=5){
            return;
        }
        this.stopAction = false;
        //当前是从前面开始向后，但是未到后面
        if(this.curFront && !this.curBack){
            this.listTweenToEnd();
        }else if(!this.curFront && this.curBack){
            this.listTweenToStart();
        }
    }

    private listTweenToEnd()
    {
        if(!this.stopAction){
            this.curFront = true;
            this.curBack = false;
            var endCompletHandler = new Laya.Handler(this,this.listTweenToStart,null,true);
            this.guesslist.tweenTo(this.matrixBannerDatas.length-1,this.dur,endCompletHandler);
        }
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            this.curFront = false;
            this.curBack = true;
            var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.guesslist.tweenTo(0,this.dur,startCompleteHandler);
        } 
    }

    private onGuessLikeItemMouseEvent(e:Event,index: number): void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true;
                console.log("当前选择的guesslikeh索引：" + index);
                YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_GuessLikeH;
                var tmpData = this.matrixBannerDatas[index]
                tmpData.locationIndex = BI_PAGE_TYPE.GUESS
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
            }
        }else if(e.type == 'mouseover'){
        
        }
        
    }

    private startOtherCall(state){
        this.isClick = false;
        this.starGuessLikeHAction();
    }

}