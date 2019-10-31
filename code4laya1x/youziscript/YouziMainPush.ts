module YouziMainPush_Module
{
    export class YouziMainPush extends ui.youzi.Youzi_MainPushUI
    {
        private mainRecItemExposure = {};
        private angel = 0;
        private curMainRecIndex = 0;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;

        private leftTween:Laya.Tween = null;
        private rightTween:Laya.Tween = null;

        constructor()
        {
            super();
            this.visible = false;
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

        offUIStateCall()
        {
            if(this.uiStateCallCopy){
                this.uiStateCallCopy = null;
            }
        }

        onMyStart()
        {
            var isMainDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(isMainDataOk){
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {
            if(YouziDataModule.YouziData.mainRecDatas.length > 0)
            {
                this.btnMainRec.on(Laya.Event.CLICK,this,this.onBtnMainRecClicked);
                this.pushIcon.loadImage(YouziDataModule.YouziData.mainRecDatas[0].iconImg,0, 0, 92, 90);
                this.slogan.text = YouziDataModule.YouziData.mainRecDatas[0].slogan;
                this.btnMainRecBg.rotation = 10;
                this.visible = true;
                this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_MainPush,{complete:true});
                YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.mainRecDatas[0], YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.startTimerLoop();
            }
        }

        startTimerLoop()
        {
            if(YouziDataModule.YouziData.mainRecDatas.length > 1){
                Laya.timer.loop(5000,this,this.updateMainRec);
            }
            this.mainPushRotationAction();
        }

        clearTimerLoop()
        {
            //清除计时器后，旋转角度变回10
            this.btnMainRecBg.rotation = 10;
            if(YouziDataModule.YouziData.mainRecDatas.length > 1){
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
            this.rightTween = Laya.Tween.to(this.btnMainRecBg,{rotation:-10},2000,null,new Handler(this,this.rotationLeft));
        }

        //像左边旋转
        private rotationLeft(actionCompleteCall)
        {
          this.leftTween = Laya.Tween.to(this.btnMainRecBg,{rotation:10},2000,null,new Handler(this,this.rotatotionRight));
        }

        private updateMainRec()
        {
            this.curMainRecIndex = this.curMainRecIndex+1>=YouziDataModule.YouziData.mainRecDatas.length?0:this.curMainRecIndex+1;
            //清除上一次的绘制
            this.pushIcon.graphics.clear(true);
            this.pushIcon.loadImage(YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].iconImg,0, 0, 92, 90);
            this.slogan.text = YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].slogan
                
            if(!this.mainRecItemExposure[YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].appid]){
                YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex], YouziDataModule.BI_PAGE_TYPE.MAIN);
                this.mainRecItemExposure[YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex].appid] = 1;
            }
        }

        private onBtnMainRecClicked()
        {
            console.log('点击主推:',this.curMainRecIndex);
            YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_MainPush;
            var tmpData = YouziDataModule.YouziData.mainRecDatas[this.curMainRecIndex];
            tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.MAIN;
            YouziDataModule.YouziData.startOtherGame(tmpData,null);
            this.updateMainRec();
        }

    }
}