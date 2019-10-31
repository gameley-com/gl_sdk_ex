module YouziMultipleMainPush_Module{
    export  class YouziMultipleMainPush extends ui.youzi.Youzi_MainPushUI{
        private mainRecData = null;
        private mainRecItemExposure = {};
        private angel = 0;
        private curMainRecIdx = 0;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;

        private leftTween:Laya.Tween = null;
        private rightTween:Laya.Tween = null;

        private startTimer = true;
        
        constructor(mainData){
            super();
            this.mainRecData = mainData;
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

        onMyStart(){
            this.initShow();
        }

        initShow(){
            if(this.mainRecData){
                this.btnMainRec.on(Laya.Event.CLICK, this, this.onBtnMainRecClicked);
                this.visible = true;
                this.btnMainRecBg.visible = true
                this.btnMainRec.loadImage(this.mainRecData.iconImg,0, 0, 92, 90);
                this.slogan.text = this.mainRecData.slogan;
                this.btnMainRecBg.rotation = 10;
                YouziDataModule.YouziData.sendExposureLog(this.mainRecData, YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.mainRecItemExposure[this.mainRecData.appid] = 1;
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_MainPush,{complete:true});
                this.startTimerLoop();
            }
        }

        startTimerLoop()
        {
            // if(this.mainRecDatas.length > 1){
            //     Laya.timer.loop(5000,this,this.updateMainRec);
            // }
            if(this.startTimer){
                this.startTimer = false;
                this.mainPushRotationAction();
            }
                
        }

        clearTimerLoop()
        {
            //清除计时器后，旋转角度变回10
            this.btnMainRecBg.rotation = 10;
            this.startTimer = true;
            // if(this.mainRecDatas.length > 1){
            //     Laya.timer.clear(this,this.updateMainRec);
            // }
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
        
        }

        updateMainRecMultiple(mainPushData):void{
            this.mainRecData = mainPushData;
            this.btnMainRec.graphics.clear(true);
            this.btnMainRec.loadImage(mainPushData.iconImg,0, 0, 92, 90);
            this.slogan.text = mainPushData.slogan;
            if(!this.mainRecItemExposure[mainPushData.appid])
            {
                YouziDataModule.YouziData.sendExposureLog(mainPushData,YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.mainRecItemExposure[mainPushData.appid] = 1;
            }
        }
    
        private onBtnMainRecClicked(){   
            YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_MainPush;
            this.mainRecData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MAIN
            YouziDataModule.YouziData.startOtherGame(this.mainRecData,null);
            // this.updateMainRec();
        }

    }
}

