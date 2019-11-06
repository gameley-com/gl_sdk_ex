var YouziAtlasPngAnima_Module;
(function (YouziAtlasPngAnima_Module) {
    var YouziAtlasPngAnima = /** @class */ (function () {
        function YouziAtlasPngAnima() {
            //所有数据类型中动画，用json保存，key为动画图集png网址，value是创建后的动画，同个key的网址一样就可以不创建，直接给value
            this.atlasPngUrl = null;
            this.animationTemp = null;
            this.animaPlaySpeed = 300;
        }
        /**
         *
         * @param url 图集png地址
         * @param animation Laya动画对象
         * @param createCompleteCall 动画图片绑定完成回调，返回绑定了动画图片的动画对象
         */
        YouziAtlasPngAnima.prototype.createAnimation = function (url, animation, createCompleteCall) {
            this.atlasPngUrl = url;
            this.animationTemp = animation;
            if (YouziDataModule.AllDataAnimaTypeJson.hasOwnProperty(this.atlasPngUrl)) {
                createCompleteCall(YouziDataModule.AllDataAnimaTypeJson[this.atlasPngUrl]);
            }
            else {
                this.loadAnimaRes(createCompleteCall);
            }
        };
        //如果allDataAnimaTypeJson中已经保存过创建的则直接返回动画对象，否则创建
        YouziAtlasPngAnima.prototype.loadAnimaRes = function (createCompleteCall) {
            Laya.loader.load(this.atlasPngUrl, new Laya.Handler(this, this.atlasPngRect, [createCompleteCall]), null, Laya.Loader.IMAGE);
        };
        //对图集png按规定好的宽高和数量分割成单张图片,
        YouziAtlasPngAnima.prototype.atlasPngRect = function (createCompleteCall, texture) {
            var animaUnitTextureArr = [];
            for (var i = 0; i < 4; i++) {
                for (var j = 0; j < 4; j++) {
                    var unitTexture = Laya.Texture.createFromTexture(texture, j * YouziAtlasPngAnima.unitAtlasPng, i * YouziAtlasPngAnima.unitAtlasPng, YouziAtlasPngAnima.unitAtlasPng, YouziAtlasPngAnima.unitAtlasPng);
                    var unitGraphics = new Laya.Graphics();
                    unitGraphics.drawTexture(unitTexture);
                    animaUnitTextureArr.push(unitGraphics);
                }
            }
            this.animationTemp.frames = animaUnitTextureArr;
            this.animationTemp.interval = this.animaPlaySpeed;
            YouziDataModule.AllDataAnimaTypeJson[this.atlasPngUrl] = this.animationTemp;
            createCompleteCall(this.animationTemp);
        };
        // private static instance:YouziAtlasPngAnima = null;
        YouziAtlasPngAnima.unitAtlasPng = 120;
        return YouziAtlasPngAnima;
    }());
    YouziAtlasPngAnima_Module.YouziAtlasPngAnima = YouziAtlasPngAnima;
})(YouziAtlasPngAnima_Module || (YouziAtlasPngAnima_Module = {}));
