"use strict";
exports.__esModule = true;
var YouziData_1 = require("./YouziData");
var YouziAtlasPngAnima = /** @class */ (function () {
    function YouziAtlasPngAnima(width, height) {
        //所有数据类型中动画，用json保存，key为动画图集png网址，value是创建后的动画，同个key的网址一样就可以不创建，直接给value
        this.atlasPngUrl = null;
        this.animaPlaySpeed = 100;
        if (width || width > 120)
            YouziAtlasPngAnima.unitAtlasPngWidth = width;
        if (height || height > 120)
            YouziAtlasPngAnima.unitAtlasPngHeight = height;
    }
    /**
     *
     * @param url 图集png地址
     * @param animation Laya动画对象
     * @param createCompleteCall 动画图片绑定完成回调，返回绑定了动画图片的动画对象
     */
    YouziAtlasPngAnima.prototype.createAnimation = function (url, createCompleteCall) {
        this.atlasPngUrl = url;
        if (YouziData_1.AllDataAnimaTypeJson.hasOwnProperty(this.atlasPngUrl)) {
            createCompleteCall(YouziData_1.AllDataAnimaTypeJson[this.atlasPngUrl]);
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
                var unitTexture = Laya.Texture.createFromTexture(texture, j * YouziAtlasPngAnima.unitAtlasPngWidth, i * YouziAtlasPngAnima.unitAtlasPngHeight, YouziAtlasPngAnima.unitAtlasPngWidth, YouziAtlasPngAnima.unitAtlasPngHeight);
                var unitGraphics = new Laya.Graphics();
                unitGraphics.drawTexture(unitTexture);
                animaUnitTextureArr.push(unitGraphics);
            }
        }
        var animation = new Laya.Animation;
        animation.frames = animaUnitTextureArr;
        animation.interval = this.animaPlaySpeed;
        YouziData_1.AllDataAnimaTypeJson[this.atlasPngUrl] = animation;
        createCompleteCall(animation);
    };
    // private static instance:YouziAtlasPngAnima = null;
    YouziAtlasPngAnima.unitAtlasPngWidth = 120;
    YouziAtlasPngAnima.unitAtlasPngHeight = 120;
    return YouziAtlasPngAnima;
}());
exports["default"] = YouziAtlasPngAnima;
