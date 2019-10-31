module YouziAtlasPngAnima_Module{
    export class YouziAtlasPngAnima{
        // private static instance:YouziAtlasPngAnima = null;
        private static unitAtlasPng = 120;
        //所有数据类型中动画，用json保存，key为动画图集png网址，value是创建后的动画，同个key的网址一样就可以不创建，直接给value
        private atlasPngUrl = null;
        private animationTemp:Laya.Animation = null;
        private animaPlaySpeed = 300;

        /**
         * 
         * @param url 图集png地址
         * @param animation Laya动画对象
         * @param createCompleteCall 动画图片绑定完成回调，返回绑定了动画图片的动画对象
         */
        createAnimation(url:string,animation:Laya.Animation,createCompleteCall:Function)
        {
            this.atlasPngUrl = url;
            this.animationTemp = animation;
            if(YouziDataModule.AllDataAnimaTypeJson.hasOwnProperty(this.atlasPngUrl))
            {
                createCompleteCall(YouziDataModule.AllDataAnimaTypeJson[this.atlasPngUrl]);
            }else{
                this.loadAnimaRes(createCompleteCall);
            }
        }

        //如果allDataAnimaTypeJson中已经保存过创建的则直接返回动画对象，否则创建
        private loadAnimaRes(createCompleteCall:Function)
        {
            Laya.loader.load(this.atlasPngUrl,new Laya.Handler(this,this.atlasPngRect,[createCompleteCall]),null,Laya.Loader.IMAGE);
        }
        //对图集png按规定好的宽高和数量分割成单张图片,
        private atlasPngRect(createCompleteCall:Function,texture:Laya.Texture)
        {
            var animaUnitTextureArr = [];
            for(var i=0;i<4;i++)
            {
                for(var j=0;j<4;j++)
                {
                    var unitTexture = Laya.Texture.createFromTexture(texture,j*YouziAtlasPngAnima.unitAtlasPng,i*YouziAtlasPngAnima.unitAtlasPng,
                        YouziAtlasPngAnima.unitAtlasPng,YouziAtlasPngAnima.unitAtlasPng);
                    var unitGraphics = new Laya.Graphics();
                    unitGraphics.drawTexture(unitTexture);
                    animaUnitTextureArr.push(unitGraphics); 
                }
            }
            this.animationTemp.frames = animaUnitTextureArr;
            this.animationTemp.interval = this.animaPlaySpeed;
            YouziDataModule.AllDataAnimaTypeJson[this.atlasPngUrl] = this.animationTemp;
            createCompleteCall(this.animationTemp);
            
        }
    }
}