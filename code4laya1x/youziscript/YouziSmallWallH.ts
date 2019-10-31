module YouziSmallWallH_Module
{
    export class YouziSmallWallH extends ui.youzi.Youzi_SmallWallHUI
    {
        private smallWallHDatas = [];
        private smallWallHItemExposure = {};
        private smallWallHItemExposureCount = 0;
        private uiCompleteCallCopy:Function = null;

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

        onMyStart()
        {
            var isSmallWallDataOk = YouziDataModule.YouziData._isDataLoaded;
            if(isSmallWallDataOk)
            {
                this.initShow();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.initShow.bind(this));
            }
        }

        private initShow()
        {
            if(YouziDataModule.YouziData.moreDatas.length > 0){
                var arr:Array<any> = [];
                for(var i=0; i<YouziDataModule.YouziData.moreDatas.length;i++)
                {
                    arr.push({
                        icon:YouziDataModule.YouziData.moreDatas[i].iconImg,
                        namelab: YouziDataModule.YouziData.moreDatas[i].title
                    });
                }
                this.smallWallListH.array = arr;
                this.smallWallListH.renderHandler = new Handler(this,this.onListRender);
                this.smallWallListH.mouseHandler = new Handler(this,this.onSmallWallListItemMouseEvent);
                this.visible = true;
                this.SmallWallUIH.visible = true;
                this.starSmallWallAction();
            }else{
                console.log('大家都在玩儿 没有数据');
            }
        }

        private onListRender(cell:Laya.Box,index:number)
        {
            // console.log('small index : ',index);
            // var icon:Laya.Image = cell.getChildByName('icon') as Laya.Image;
            // icon.loadImage(this.smallWallHDatas[index].iconImg);
            this.checkSendExpsureLog(index);
        }

        private checkSendExpsureLog(index)
        {
            if(this.visible && this.SmallWallUIH.visible)
            {
                if(!this.smallWallHItemExposure[YouziDataModule.YouziData.moreDatas[index].appid])
                {
                    // console.log('---send log moregame index:',index);
                    YouziDataModule.YouziData.sendExposureLog(YouziDataModule.YouziData.moreDatas[index],YouziDataModule.BI_PAGE_TYPE.SMALL_MATRIX_WALL);
                    this.smallWallHItemExposure[YouziDataModule.YouziData.moreDatas[index].appid] = 1;
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
            this.dur = (this.smallWallHDatas.length-8)*2000;
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
                    var tmpData = YouziDataModule.YouziData.moreDatas[index];
                    tmpData.locationIndex = YouziDataModule.BI_PAGE_TYPE.SMALL_MATRIX_WALL;
                    YouziDataModule.YouziData.startOtherGame(tmpData,this.startOtherCall.bind(this));
                    if(tmpData.hotred == 1){
                        var tmpSlideHit:Laya.Image = this.smallWallListH.getCell(index).getChildByName('icon').getChildByName('redhit') as Laya.Image;
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
}