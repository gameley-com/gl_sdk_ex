import { ui } from "../ui/layaMaxUI";
import { YouziData, BI_PAGE_TYPE } from "./YouziData";
import YouziAtlasPngAnima from "./YouziAtlasPngAnima";

export default class YouziFullMatrixScreen extends ui.youzi.Youzi_FullScreenUI{

    private fullScreenData = [];
    private fullScreenExposure = {};
    private hw = 0;
    private breaki = 15;

    private curFront = true;
    private curBack = false;
    private stopAction = false;
    private isClick = false;
    private dur = 5000;

    constructor(){
        super();
        this.visible = false;
        this.FullScreenUI.visible = false;
        // this.FullScreenList.scrollBar.hide = true;
        this.scaleX = 0;
        this.scaleY = 0;
        this.pivotX = this.width/2;
        this.pivotY = this.height/2;
        
        this.FullScreenList.vScrollBarSkin = "";
        if(Laya.stage.width<Laya.stage.height){
            this.hw = Laya.Browser.height/Laya.Browser.width;
        }else{
            this.hw = Laya.Browser.width/Laya.Browser.height;    
        }
        if(this.hw>1.9){
            //全面屏
            this.height = 1500;
            this.FullScreenUI.height = 1500;
            this.FullScreenList.repeatX = 3;
            this.FullScreenList.repeatY = 5;
            this.FullScreenList.height = 1280;
            this.pos(Laya.stage.width/2,Laya.stage.height/2-120);
            this.breaki = 15
        }else{
            this.pos(Laya.stage.width/2,Laya.stage.height/2);
        }
    }

    onEnable()
    {
        var screenDataOk = YouziData._isDataLoaded;
        if(screenDataOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    private initShow()
    {
        this.fullScreenData = YouziData.fullMatrixScreenDatas;
        if(this.fullScreenData.length>0){
            this.dur = this.fullScreenData.length > 12?(this.fullScreenData.length-12)*5000:5000;
            this.closeFullScreen.on(Laya.Event.CLICK,this,this.onCloseFullScreen);
            var fullScreenListArr = [];
            for(var i=0;i<this.fullScreenData.length;i++){
                if(this.fullScreenData[i].dynamicType == 1 && this.fullScreenData[i].dynamicIcon){
                    fullScreenListArr.push({icon:"",namelab:this.fullScreenData[i].title});
                }else{
                    fullScreenListArr.push({icon:this.fullScreenData[i].iconImg,namelab:this.fullScreenData[i].title});
                }
            }
            this.FullScreenList.array = fullScreenListArr;
            this.FullScreenList.mouseHandler = new Laya.Handler(this,this.onItemClick);
            this.FullScreenList.renderHandler = new Laya.Handler(this,this.onListRender);
        }else{
            console.log('全屏落地页无数据');
        }
    }

    private onListRender(box:Laya.Box,index:number):void
    {
        if(this.fullScreenData[index].hotred == 0){
            var redhit:Laya.Image  = box.getChildByName("redhit") as Laya.Image;
            redhit.visible = false;
        }
        // console.log('======>index:'+index);
        var iconAnima = box.getChildByName("iconAnima") as Laya.Animation;
        iconAnima.frames = [];
        if(this.fullScreenData[index].dynamicType == 1 && this.fullScreenData[index].dynamicIcon){
            // console.log('======>index:'+index+",dynamicType:"+this.fullScreenData[index].dynamicType+",dynamicIcon:"+this.fullScreenData[index].dynamicIcon);   
            iconAnima.scale(1.66,1.66);
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(this.fullScreenData[index].dynamicIcon,
                // iconAnima,
                function(anima){
                    // console.log('anima play index:'+index);
                    iconAnima.frames = anima.frames;
                    iconAnima.interval = anima.interval;
                    iconAnima.play();
            })
        }
        this.checkSendExpsureLog(index);
    }

    private checkSendExpsureLog(index)
    {
        if(this.FullScreenUI.visible)
        {
            if(!this.fullScreenExposure[this.fullScreenData[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(this.fullScreenData[index],BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                this.fullScreenExposure[this.fullScreenData[index].appid] = 1;
            }
        }
    }

    public showFullScreen()
    {
        if(this && this.parent){
            this.visible = true;
            this.FullScreenUI.visible = true;
            Laya.Tween.to(this,{scaleX:1,scaleY:1},500,Laya.Ease.quadIn,Laya.Handler.create(this,this.showActionFinsh));
        }
    }

    private showActionFinsh()
    {
        this.checkExposure();
        this.starFullListAction();
    }

    private onCloseFullScreen(){
        this.stopFullListAcion();
        Laya.Tween.to(this,{scaleX:0,scaleY:0},500,Laya.Ease.quadInOut,Laya.Handler.create(this,this.closeActionFinsh));
    }

    private closeActionFinsh(){
        this.visible = false;
        this.FullScreenUI.visible = false;
        this.fullScreenExposure = {};
    }

    private stopFullListAcion()
    {
        this.stopAction = true;
    }

    private starFullListAction()
    {
        this.fullScreenListAutoScroll();
    }

    private fullScreenListAutoScroll(){
        if(!this.FullScreenUI.visible)
            return;
        if(this.fullScreenData.length<=15){
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
            this.FullScreenList.tweenTo(this.fullScreenData.length-1,this.dur,endCompletHandler);
        }
        this.curFront = true;
        this.curBack = false;
    }

    private listTweenToStart()
    {
        if(!this.stopAction){
            var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
            this.FullScreenList.tweenTo(0,this.dur,startCompleteHandler);
        }
        this.curFront = false;
        this.curBack = true;
    }

    private onItemClick(e:Event,index:number):void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            console.log("当前选择的全屏落地页索引：" + index);
            var tmpData = this.fullScreenData[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FULL_MATRIX_SCRENN;
            YouziData.startOtherGame(tmpData,null);
            // if(tmpData.hotred == 1){
            //     var tmpSlideHit:Laya.Image = this.FullScreenList.getCell(index).getChildByName('redhit') as Laya.Image;
            //     tmpSlideHit.visible = false;
            //     this.fullScreenData[index].hotred = 0;
            // }
        }else if(e.type == 'mouseover'){
        
        }
    }

    private checkExposure()
     {
        if(this.FullScreenUI.visible){
            for(var i=0; i<this.fullScreenData.length; i++){
                var infoData = this.fullScreenData[i];
                if(!this.fullScreenExposure[infoData.appid]){
                    this.fullScreenExposure[infoData.appid] = 1;
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.FULL_MATRIX_SCRENN);
                }
                
                if(i>=this.breaki){
                    break;
                }
            }
        }
    }

}