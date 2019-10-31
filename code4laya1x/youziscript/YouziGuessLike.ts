module YouziGuessLike_Module
{
    export class YouziGuessLike extends ui.youzi.Youzi_GuessLikeUI
    {
        private guessAnyItemExposure = {};
        private firstShow = false;
        private uiCompleteCallCopy:Function = null;
        private uiStateCallCopy:Function = null;
        private curFront = true;
        private curBack = false;
        private stopAction = false;
        private isClick = false;
        private dur = 10;
        
        constructor()
        {
            super();
            this.visible = false;
            this.guessUI.visible = false;
            this.guessList.scrollBar.hide = true;
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
            if(this.uiStateCallCopy)
            {
                this.uiStateCallCopy = null;
            }
        }

        onMyStart()
        {
            var guessLikeDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(guessLikeDataOk){
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {
            if(YouziDataModule.YouziData.matrixBannerDatas.length <= 0)
            {
                return;
            }
            var arr:Array<any> = [];
            for(var i=0; i<YouziDataModule.YouziData.matrixBannerDatas.length;i++)
            {
                if(YouziDataModule.YouziData.matrixBannerDatas[i].dynamicType == 1 && 
                YouziDataModule.YouziData.matrixBannerDatas[i].dynamicIcon){
                    arr.push({});
                }else{
                    arr.push({icon:YouziDataModule.YouziData.matrixBannerDatas[i].iconImg});
                }
            }

            this.guessList.array = arr;
            this.guessList.renderHandler = new Handler(this,this.onListRender);
            this.guessList.mouseHandler = new Handler(this,this.onGuessLikeItemMouseEvent);

            this.visible = true;
            this.guessUI.visible = true;
            this.notifyUIComplete(YouziDataModule.YOUZI_UI_ID.Youzi_GuessLike,{complete:true});
            this.notifyUIState(YouziDataModule.YOUZI_UI_ID.Youzi_GuessLike,{uiVisible:true});
            this.starGuessLikeAction();
        }

        private onListRender(item:Laya.Box,index:number):void
        {
            //  console.log('------->render guesslike : ',index);
            if(YouziDataModule.YouziData.matrixBannerDatas[index].dynamicType == 1 && 
            YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon){
                var imgAnima = item.getChildByName('iconAnima') as Laya.Animation;
                imgAnima.visible = true;
                var youziAnima = new YouziAtlasPngAnima_Module.YouziAtlasPngAnima();
                youziAnima.createAnimation(
                    YouziDataModule.YouziData.matrixBannerDatas[index].dynamicIcon,
                    imgAnima,
                    function(anima){
                        imgAnima = anima;
                        imgAnima.play();
                    });
            }
            this.checkSendExpsureLog(index);
        }

        private checkSendExpsureLog(index)
        {
            if(this.visible && this.guessUI.visible)
            {
                if(!this.guessAnyItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid])
                {
                    // console.log('---send log index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.matrixBannerDatas[index],YouziDataModule.BI_PAGE_TYPE.GUESS);
                    this.guessAnyItemExposure[YouziDataModule.YouziData.matrixBannerDatas[index].appid] = 1;
                }
            }
        }

        stopGuessLikeAcion()
        {
            this.stopAction = true;
        }

        starGuessLikeAction()
        {
            this.guessAnylistAutoScroll();
        }

        private guessAnylistAutoScroll()
        {
            if(!this.guessUI.visible)
                return;
            if(YouziDataModule.YouziData.matrixBannerDatas.length<=5){
                return;
            }
            this.stopAction = false;
            this.dur = (YouziDataModule.YouziData.matrixBannerDatas.length-5)*5000;
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
                this.guessList.tweenTo(YouziDataModule.YouziData.matrixBannerDatas.length-1,this.dur,endCompletHandler);
            }
            this.curFront = true;
            this.curBack = false;
        }

        private listTweenToStart()
        {
            if(!this.stopAction){
                var startCompleteHandler = new Laya.Handler(this,this.listTweenToEnd,null,true); 
                this.guessList.tweenTo(0,this.dur,startCompleteHandler);
            }
            this.curFront = false;
            this.curBack = true;
        }

        private onGuessLikeItemMouseEvent(e:Event, index: number): void
        {
            if(e.type == 'mousedown'){

            }else if(e.type == 'mouseup'){
                if(!this.isClick){
                    console.log("当前选择的guesslike索引：" + index);
                    YouziDataModule.YouziData.clickGameYouziUIId = YouziDataModule.YOUZI_UI_ID.Youzi_GuessLike;
                    this.isClick = true;
                    var tmpData = YouziDataModule.YouziData.matrixBannerDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.GUESS;
                    YouziDataModule.YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                }
            }else if(e.type == 'mouseover'){
            
            }
        }

        private startOtherCall(state){
            this.isClick = false;
            this.starGuessLikeAction();
        }

    }
}