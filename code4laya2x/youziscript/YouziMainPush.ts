import {ui} from  '../ui/layaMaxUI'
import { YouziData, YOUZI_UI_ID, BI_PAGE_TYPE } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziMainPush extends ui.youzi.Youzi_MainPushUI{
    private mainRecDatas = [];
    private mainRecItemExposure = {};
    private angel = 0;
    private curMainRecIdx = 0;
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;

    private leftTween:Laya.Tween = null;
    private rightTween:Laya.Tween = null;
    
    private startTimer = true;

    constructor(){
        super();
        this.visible = false;
        this.btnMainRecBg.visible = false;
    }

    setYouziPosition(x:number,y:number){
        this.centerX = NaN;
        this.centerY = NaN;
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
        var isMainDataOk = YouziData._isDataLoaded;
        if(isMainDataOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }

    initShow(){
        this.mainRecDatas = YouziData.mainRecDatas;
        if(this.mainRecDatas.length>0){
            this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
            this.visible = true;
            this.btnMainRecBg.visible = true
            this.btnMainRecBg.rotation = 10;
            this.addMainAnimaOrImage();
            YouziData.sendExposureLog(this.mainRecDatas[0], BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[this.mainRecDatas[0].appid] = 1;
            this.notifyUIComplete(YOUZI_UI_ID.Youzi_MainPush,{complete:true});
            this.startTimerLoop();
        }
    }

    startTimerLoop()
    {
        if(this.startTimer){
            this.startTimer = false;
            if(this.mainRecDatas.length > 1){
                Laya.timer.loop(5000,this,this.updateMainRec);
            }
            this.mainPushRotationAction();
        }
    }

    clearTimerLoop()
    {
        //清除计时器后，旋转角度变回10
        this.btnMainRecBg.rotation = 10;
        this.startTimer = true;
        if(this.mainRecDatas.length > 1){
            Laya.timer.clear(this,this.updateMainRec);
        }
        if(this.leftTween){
            Laya.Tween.clear(this.leftTween);
        }
        if(this.rightTween){
            Laya.Tween.clear(this.rightTween);
        }
    }

    /**
     * 主推动画
     * 1、默认角度是10
     * 2、向右转到-10
     * 3、完成之后向左转到10
     * 4、重复2、3
     */
    private mainPushRotationAction()
    {
        this.rotatotionRight();
    }

    //向右边旋转
    private rotatotionRight()
    {
        this.rightTween = Laya.Tween.to(this.btnMainRecBg,{rotation:-10},2000,null,new Laya.Handler(this,this.rotationLeft));
    }

    //像左边旋转
    private rotationLeft(actionCompleteCall)
    {
        this.leftTween = Laya.Tween.to(this.btnMainRecBg,{rotation:10},2000,null,new Laya.Handler(this,this.rotatotionRight));
    }

    private updateMainRec(): void {
        this.curMainRecIdx = this.curMainRecIdx+1>=this.mainRecDatas.length?0:this.curMainRecIdx+1
        this.btnMainRec.graphics.clear(true);
        // this.btnMainRec.loadImage(this.mainRecDatas[this.curMainRecIdx].iconImg);
        this.addMainAnimaOrImage();
        this.slogan.text = this.mainRecDatas[this.curMainRecIdx].slogan;
        if(!this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid]){
            YouziData.sendExposureLog(this.mainRecDatas[this.curMainRecIdx], BI_PAGE_TYPE.MAIN);
            this.mainRecItemExposure[this.mainRecDatas[this.curMainRecIdx].appid] = 1;
        }
    }

    private addMainAnimaOrImage()
    {
        if(this.mainRecDatas[this.curMainRecIdx].dynamicType==1 && this.mainRecDatas[this.curMainRecIdx].dynamicIcon){
            var mainSelf = this;
            this.mainAnima.scale(0.75,0.75);
            var mainYouziAnima = new YouziAtlasPngAnima();
            mainYouziAnima.createAnimation(
                this.mainRecDatas[this.curMainRecIdx].dynamicIcon,
                // this.mainAnima,
                function(anima){
                    mainSelf.mainAnima.frames = anima.frames;
                    mainSelf.mainAnima.interval = anima.interval;
                    mainSelf.mainAnima.visible =true;
                    mainSelf.mainAnima.play();   
                }
            );
        }else{
            this.btnMainRec.loadImage(this.mainRecDatas[this.curMainRecIdx].iconImg);
        }
        this.slogan.text = this.mainRecDatas[this.curMainRecIdx].slogan;
    }

    private onBtnMainRecClicked(){   
        YouziData.clickGameYouziUIId = YOUZI_UI_ID.Youzi_MainPush;
        var tmpData = this.mainRecDatas[this.curMainRecIdx]
        tmpData.locationIndex = BI_PAGE_TYPE.MAIN
        YouziData.startOtherGame(tmpData,null);
        this.updateMainRec();
    }

}