import {ui} from  '../ui/layaMaxUI'
import { YouziData, YOUZI_UI_ID, BI_PAGE_TYPE } from './YouziData';
import YouziAtlasPngAnima from './YouziAtlasPngAnima';

export default class YouziSlideWindow extends ui.youzi.Youzi_SlideWindowUI{

    private hotlistDatas = [];
    private slideItemExposure = {};
    private uiCompleteCallCopy:Function = null;
    private uiStateCallCopy:Function = null;
    private slideButton:Laya.Button = null;
    private slideMask:Laya.Button = null;
    private showFirst = false;
    private isLeft = false;

    constructor(leftOrRight){
        super();
        this.isLeft = leftOrRight;
        this.centerY = 0;
        this.visible = false;
        this.SlideWindowUI.visible = false;
        this.slideList.scrollBar.hide = true;
        if(!leftOrRight){
            this.right = -this.width
            this.slideBg.scaleX = -1;
            this.slideBg.pos(this.slideBg.width, this.slideBg.y);
            this.slideList.pos(2*this.slideList.x,this.slideList.y);
        }else{
            this.left = -this.width;
            // this.left = 0;
        }
    }

    setYouziPosition(y:number){
        this.centerX = NaN;
        this.centerY = NaN;
        this.SlideWindowUI.pos(this.SlideWindowUI.x,y);
    }
    
    setSlideButton(slideBtn:Laya.Button)
    {
        this.slideButton = slideBtn;
    }

    setSlideMask(slideViewMask:Laya.Button){
        this.slideMask = slideViewMask;
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
        var isSlideDataOk = YouziData._isDataLoaded;
        if(isSlideDataOk){
            this.initShow();
        }else{
            YouziData._loadedCallBacks.push(this.initShow.bind(this));
        }
    }
    //显示抽屉按钮，隐藏抽屉遮罩
    private showSlideBtnAndHideSlideMask()
    {
        if(this.slideButton)
            this.slideButton.visible = true;
        if(this.slideMask)
            this.slideMask.visible = false;
    }

    //隐藏抽屉按钮，显示抽屉遮罩
    private hideSlideBtnAndShowSlideMask()
    {
        if(this.slideButton)
            this.slideButton.visible = false;
        if(this.slideMask)
            this.slideMask.visible = true;
    }

    showSlideWindow(){
        if(this.hotlistDatas.length <= 0)
        {
            console.log('抽屉没有数据');
            return;
        }

        if(!this.SlideWindowUI.visible){
            this.visible = true;
            this.SlideWindowUI.visible = true;
            this.hideSlideBtnAndShowSlideMask();
            var self = this;
            this.slideWindowActionShow(function(){
                self.notifyUIState(YOUZI_UI_ID.Youzi_SlideWindow,{uiVisible:true});
                if(!self.showFirst){
                    self.showFirst = true;
                    self.checkExposure();
                }
            });
        }
    }

    private slideWindowActionShow(actionFinishCall){
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:0
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }else{
            Laya.Tween.to(this, {
                left:0
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall))
        }
    }

    closeSlideWindow(){
        if(this.hotlistDatas.length <= 0)
        {
            console.log('抽屉没有数据');
            return;
        }
        var self = this;
        this.slideWindowActionClose(function(){
            self.visible = false;
            self.SlideWindowUI.visible = false;
            self.btnSLideClose.visible = true;
            self.showSlideBtnAndHideSlideMask();
            self.notifyUIState(YOUZI_UI_ID.Youzi_SlideWindow,{uiVisible:false});
        });
        //点击隐藏按钮，防止动画过程中继续点击造成过多偏移
        self.btnSLideClose.visible = false;
    }

    private slideWindowActionClose(actionFinishCall){
        if(!this.isLeft){
            Laya.Tween.to(this, {
                right:-this.width
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }else{
            Laya.Tween.to(this, {
                left:-this.width
            }, 500, Laya.Ease.quadInOut, Laya.Handler.create(this,actionFinishCall));
        }
    }

    private initShow(){

        this.hotlistDatas = YouziData.hotListDatas;  
        this.btnSLideClose.on(Laya.Event.CLICK, this, this.closeSlideWindow);
        if(this.hotlistDatas.length > 0){ 
            var arr: Array<any> = [];
            var pRecord = null;
            for (var i: number = 0; i < this.hotlistDatas.length; i++) {
                pRecord = this.hotlistDatas[i];
                if(pRecord.dynamicType == 1 && pRecord.dynamicIcon){
                    arr.push({icon:"",namelab:pRecord.title});
                }else{
                    arr.push({icon:pRecord.iconImg,namelab:pRecord.title});
                }
            }
            this.slideList.array = arr;
            this.slideList.renderHandler = new Laya.Handler(this, this.onListRender);
            this.slideList.mouseHandler = new Laya.Handler(this, this.onslideListItemMouseEvent);
            this.notifyUIComplete(YOUZI_UI_ID.Youzi_SlideWindow,{complete:true});
        }
    }

    private onListRender(item: Laya.Box, index: number): void {
        // console.log('------->render slide : ',index);
        // var icon : Laya.Image = item.getChildByName('icon') as Laya.Image;
        // icon.loadImage(this.hotlistDatas[index].iconImg);
        if(this.hotlistDatas[index].hotred == 0){
            var redHitWall:Laya.Image = item.getChildByName('markImg') as Laya.Image;
            redHitWall.visible = false;
        }
        if(this.hotlistDatas[index].dynamicType == 1 && this.hotlistDatas[index].dynamicIcon){
            var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
            imgAnima.scale(1.08,1.08);
            imgAnima.visible = true;
            var youziAnima = new YouziAtlasPngAnima();
            youziAnima.createAnimation(
                this.hotlistDatas[index].dynamicIcon,
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
        if(this.visible && this.SlideWindowUI.visible)
        {
            if(!this.slideItemExposure[this.hotlistDatas[index].appid])
            {
                // console.log('---send log moregame index:',index);
                YouziData.sendExposureLog(this.hotlistDatas[index],BI_PAGE_TYPE.FLOAT);
                this.slideItemExposure[this.hotlistDatas[index].appid] = 1;
            }
        }
    }

    private onslideListItemMouseEvent(e:Event,index: number): void
    {
        if(e.type == 'mousedown'){
         
        }else if(e.type == 'mouseup'){
            console.log("当前选择的抽屉索引：" + index);
            var tmpData = this.hotlistDatas[index];
            tmpData.locationIndex = BI_PAGE_TYPE.FLOAT;
            YouziData.startOtherGame(tmpData,null);
            if(tmpData.hotred == 1){
                var tmpSlideHit:Laya.Image = this.slideList.getCell(index).getChildByName('markImg') as Laya.Image;
                tmpSlideHit.visible = false;
            }
        }else if(e.type == 'mouseover'){
        
        }
    }

    private checkExposure()
    {

        if(this.SlideWindowUI.visible)
        {
            for(var i=0; i<this.hotlistDatas.length; i++)
            {
                var infoData = this.hotlistDatas[i];
                // console.log(infoData)
                if(!this.slideItemExposure[infoData.appid])
                {
                    this.slideItemExposure[infoData.appid] = 1
                    YouziData.sendExposureLog(infoData, BI_PAGE_TYPE.FLOAT)
                }
                
                if(i >= 11)
                    break;
            }
        }
    }


}