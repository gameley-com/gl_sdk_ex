import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE, YOUZI_UI_ID } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

export default class YouziSmallWallH extends ui.youzi.Youzi_SmallWallHUI
{
    private smallWallHDatas = [];
    private smallWallHItemExposure = {};
    private smallWallHItemExposureCount = 0;
    private uiCompleteCallCopy:Function = null;
    // private uiStateCallCopy:Function = null;
    
    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;

    constructor()
    {
        super();
        this.visible = false;
        this.SmallWallUIH.visible = false;
        this.smallWallListH.scrollBar.hide = true;
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

    offUICompleteCall()
    {
        if(this.uiCompleteCallCopy)
        {
            this.uiCompleteCallCopy = null;
        }
    }

    onEnable()
    {
        var isSmallWallDataOk = YouziData._isDataLoaded;
        if(isSmallWallDataOk)
        {
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    private initShow()
    {
        this.smallWallHDatas = YouziData.moreDatas;
        if(this.smallWallHDatas.length > 0)
        { 
            var arr: Array<any> = [];
            var pRecord = null;
            for(var i:number=0; i<this.smallWallHDatas.length;i++){
                pRecord = this.smallWallHDatas[i];
                if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                    arr.push({icon:"",namelab:pRecord.title});
                }else{
                    arr.push({icon:pRecord.iconImg,namelab: pRecord.title});
                }
            }
            this.smallWallListH.renderHandler = new Laya.Handler(this,this.onListRender);
            this.smallWallListH.array = arr;
            this.smallWallListH.mouseHandler = new Laya.Handler(this,this.onSmallWallListItemMouseEvent);
            this.visible = true;
            this.SmallWallUIH.visible = true;
            this.notifyUIComplete(YOUZI_UI_ID.Youzi_SmallWall,{complete:true});
            this.dur = this.smallWallHDatas.length>8?(this.smallWallHDatas.length-8)*5000:5000;
            this.starSmallWallAction();
        }
        
    }

    private onListRender(cell:Laya.Box,index:number)
    {
        // console.log('small index : ',index);
        if(this.smallWallHDatas[index].hotred == 1){
            var redHitWallH:Laya.Image = cell.getChildByName('redhit') as Laya.Image;
            redHitWallH.visible = true;
        }
        if(this.smallWallHDatas[index].dynamicType == 1 && this.smallWallHDatas[index].dynamicIcon){
            var imgAnima = cell.getChildByName('iconAnima') as Laya.Animation;
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                this.smallWallHDatas[index].dynamicIcon,
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
        if(this.visible && this.SmallWallUIH.visible)
        {
            if(!this.smallWallHItemExposure[this.smallWallHDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(this.smallWallHDatas[index],BI_PAGE_TYPE.SMALL_MATRIX_WALL);
                this.smallWallHItemExposure[this.smallWallHDatas[index].appid] = 1;
            }
        }
    }

    stopSmallWallAcion()
    {
        this.stopAction = true;
    }

    starSmallWallAction()
    {
        this.smallWallListAutoScroll();
    }

    private smallWallListAutoScroll(){
        if(!this.SmallWallUIH.visible)
            return;
        if(this.smallWallHDatas.length<=8){
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
            this.smallWallListH.tweenTo(this.smallWallHDatas.length-1,this.dur,endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.smallWallListH.tweenTo(0,this.dur,startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onSmallWallListItemMouseEvent(e:Event,index:number):void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            if(!this.isClick){
                this.isClick = true;
                console.log("当前选择的大家都在玩儿索引：" + index);
                var tmpData = this.smallWallHDatas[index];
                tmpData.locationIndex = BI_PAGE_TYPE.SMALL_MATRIX_WALL;
                YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                if(tmpData.hotred == 1){
                    var tmpSlideHit:Laya.Image = this.smallWallListH.getCell(index).getChildByName('redhit') as Laya.Image;
                    tmpSlideHit.visible = false;
                } 
            }     
        }else if(e.type == 'mouseover'){
        
        }     
    }

    private startOtherCall(state){
        this.isClick = false;
        this.starSmallWallAction();
    }

}