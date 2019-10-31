import {ui} from  '../ui/layaMaxUI'
import { YouziData, YOUZI_UI_ID, BI_PAGE_TYPE } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziMoreGame extends ui.youzi.Youzi_MoreGameUI{

    private morelistDatas = [];
    private mainItemExposure = {};
    private fisrtShow = false;
    private isCreate = false;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;

    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;

    constructor() {
        super();
        this.centerX = 0;
        this.centerY = 0;
       
        this.visible = false;
        this.MoreGameUI.visible = false;
        this.moreGameList.scrollBar.hide = true;
        
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.MoreGameUI.pos(x,y);
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
        var isMoreGameOk = YouziData._isDataLoaded;
        if(isMoreGameOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this))
        }
    }

    public showMoreGameUI(){
        if(this.isCreate && !this.visible){
            this.visible = true
            this.moreGameList.mouseThrough = false;
            this.MoreGameUI.visible = true;
            this.starMoreGameAction();
            this.notifyUIState(YOUZI_UI_ID.Youzi_MoreGame,{uiVisible:true});
            // if(!this.fisrtShow){
            //     this.fisrtShow = true;
                this.checkExposure();
            // }
        }  
    }

    private onBtnCloseClicked (){
        this.stopMoreGameAcion();
        this.visible = false;
        this.moreGameList.mouseThrough = true;
        this.MoreGameUI.visible = false;
        this.mainItemExposure = {};
        this.notifyUIState(YOUZI_UI_ID.Youzi_MoreGame,{uiVisible:false});
    }

    private initShow(){ 
        this.moreGameCloseBtn.on(Laya.Event.CLICK,this,this.onBtnCloseClicked);
        if(YouziData.moreDatas.length > 0){
            this.morelistDatas = YouziData.moreDatas; 
            var arr: Array<any> = [];
            var pRecord = null;
            for (var i: number = 0; i < this.morelistDatas.length; i++) {
                pRecord = this.morelistDatas[i];
                if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                    arr.push({icon:"",namelab:pRecord.title});
                }else{
                    arr.push({icon:pRecord.iconImg,namelab:pRecord.title});
                }
            }
            this.moreGameList.array = arr;
            this.moreGameList.renderHandler = new Laya.Handler(this, this.onListRender);
            this.moreGameList.mouseHandler = new Laya.Handler(this, this.moreGameListMouseEvent);
            this.isCreate = true;
            this.notifyUIComplete(YOUZI_UI_ID.Youzi_MoreGame,{complete:true});
            this.dur = this.morelistDatas.length > 12?(this.morelistDatas.length-12)*5000:5000;
        }
    }

    private onListRender(item: Laya.Box, index: number): void 
    {
        // if(index < this.morelistDatas.length)
        // {
            // console.log('render moregame index:',index);
            if(this.morelistDatas[index].dynamicType == 1 && this.morelistDatas[index].dynamicIcon){
                var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
                imgAnima.scale(1.16,1.16);
                imgAnima.visible = true;
                var youziAnima = new YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    this.morelistDatas[index].dynamicIcon,
                    // imgAnima,
                    function(anima){
                        imgAnima.frames = anima.frames;
                        imgAnima.interval = anima.interval;
                        imgAnima.play();
                    });
            }
            
            // var imgIcon = item.getChildByName('icon') as Laya.Image;
            // imgIcon.loadImage(this.morelistDatas[index].iconImg);
            // var label = item.getChildByName('namelab') as Laya.Label;
            // label.text = this.morelistDatas[index].title;
            this.checkSendExpsureLog(index);
        // }
        
    }

    private checkSendExpsureLog(index)
    {
        if(this.visible && this.MoreGameUI.visible)
        {
            if(!this.mainItemExposure[this.morelistDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(this.morelistDatas[index],BI_PAGE_TYPE.MORE);
                this.mainItemExposure[this.morelistDatas[index].appid] = 1;
            }
        }
    }

    stopMoreGameAcion()
    {
        this.stopAction = true;
    }

    starMoreGameAction()
    {
        this.moreGameListAutoScroll();
    }

    private moreGameListAutoScroll(){
        if(!this.MoreGameUI.visible)
            return;
        if(this.morelistDatas.length<=12){
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
            var endCompletHandler = new Laya.Handler(this,this.listTweenToStart,null,true);
            this.moreGameList.tweenTo(this.morelistDatas.length-1,this.dur,endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.moreGameList.tweenTo(0,this.dur,startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private moreGameListMouseEvent(e:Event,index: number): void
    {   
        if(e.type == 'mousedown'){
            // if(type == 1 || type ==2){
            //     this.mouseClickChange = true;
            // }
        }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true;
                console.log("当前选择的更多游戏索引：" + index);
                var tmpData = this.morelistDatas[index];
                tmpData.locationIndex = BI_PAGE_TYPE.MORE;
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                // var curTime = YouziData.YouziDateFtt("yyyyMMdd",new Date());
                // localStorage.setItem(tmpData.appid, curTime);
            }
            
        }else if(e.type == 'mouseover'){
            
        }
     }

     private startOtherCall(){
        this.isClick = false;
        this.starMoreGameAction();
     }

     private checkExposure()
     {
        if(this.MoreGameUI.visible){
            for(var i=0; i<this.morelistDatas.length; i++){
                var infoData = this.morelistDatas[i];
                if(!this.mainItemExposure[infoData.appid]){
                    this.mainItemExposure[infoData.appid] = 1;
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.MORE);
                }
                
                if(i>=11){
                    break;
                }
            }
        }
    }

}