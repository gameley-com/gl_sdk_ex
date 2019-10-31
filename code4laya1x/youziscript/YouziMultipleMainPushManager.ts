module YouziMultipleMainPushManager_Module{
    export class YouziMultipleMainPushManager {
        //多主推个数
        private multipleAmount = 1;
        private isUpdateMainPush = false;
        //创建的多主推
        private multipleMainPushObj:Array<YouziMultipleMainPush_Module.YouziMultipleMainPush> = [];
        //多主推父节点参数json数组
        private paramsJsonArray = [];
        //从主推数组中随机取出几个元素的数组
        private randomData = [];

        private startTimerMulti = true;
        
        /**
         * 
         * @param jsonArray jso你数组，格式：[{parentNode:node,x:0,y:0}],parentNode:主推父节点，x，y为主推节点坐标
         * @param amount 主推数量
         */
        constructor(jsonArray:Array<any>){
            this.paramsJsonArray = jsonArray;
            this.initShow();
        }

        private initShow(){
            if(YouziDataModule.YouziData._isDataLoaded){
                this.creatYouziMultipleMainPush();
            }else{
                YouziDataModule.YouziData._loadedCallBacks.push(this.creatYouziMultipleMainPush.bind(this));
            }
        }

        private creatYouziMultipleMainPush()
        {
            var amountArr = YouziDataModule.YouziData.getMultiMainAmount(this.paramsJsonArray.length);
            this.multipleAmount = amountArr[0];
            this.isUpdateMainPush = amountArr[1];
            this.randomData = YouziDataModule.YouziData.getGamesIndex(YouziDataModule.YouziData.mainRecDatas.length,this.multipleAmount);
            
            for(var i=0;i<this.randomData.length;i++)
            {
                var multipleMainPush:YouziMultipleMainPush_Module.YouziMultipleMainPush = 
                    new YouziMultipleMainPush_Module.YouziMultipleMainPush(
                        YouziDataModule.YouziData.mainRecDatas[this.randomData[i]]
                    );
                multipleMainPush.onMyStart();
                var paramsJson = this.paramsJsonArray[i];
                if(this.paramsJsonArray[i])
                {
                    multipleMainPush.setYouziPosition(paramsJson.x,paramsJson.y);
                    paramsJson.parentNode.addChild(multipleMainPush);
                    this.multipleMainPushObj.push(multipleMainPush);
                }
            }
            this.startChangeTimeLoop();
        }

        //开启计时器，进行更换
        startChangeTimeLoop()
        {
            if(this.startTimerMulti){
                this.startTimerMulti = false;
                if(this.isUpdateMainPush){
                    Laya.timer.loop(5000,this,this.updateMultipleMainPush);
                }
                for(var k=0;k<this.multipleMainPushObj.length;k++){
                    this.multipleMainPushObj[k].startTimerLoop();
                }
            }
            
        }

        //停止计时器，停止更换
        stopChangeTimeLoop()
        {
            if(this.isUpdateMainPush){
                Laya.timer.clear(this,this.updateMultipleMainPush);
            }
            for(var l=0;l<this.multipleMainPushObj.length;l++){
                this.multipleMainPushObj[l].clearTimerLoop();
            }
            this.startTimerMulti = true;
        }

        private updateMultipleMainPush()
        {
            this.randomData = YouziDataModule.YouziData.getGamesIndex(YouziDataModule.YouziData.mainRecDatas.length,this.multipleAmount);
            for(var j=0;j<this.multipleMainPushObj.length;j++){
                this.multipleMainPushObj[j].updateMainRecMultiple(YouziDataModule.YouziData.mainRecDatas[this.randomData[j]]);
            }
        }


    }
}
