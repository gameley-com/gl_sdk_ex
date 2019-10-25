import { YouziData, BI_PAGE_TYPE, BANNER_TYPE } from "./YouziData";

var YouziUI_GameBanner = cc.Class({
    extends: cc.Component,

    properties: {},
    onLoad () {
        this.updateIndex = 0
        this.actionNode = this.node.getChildByName('ActionNode')

        this.bannerType = BANNER_TYPE.GAME
        this.logged = []
    },

    start () {
        if(!this.isOffSwitch)
        {
            //记录 交由中心化切换显示隐藏
            this.node.active = false
            YouziData.addBanner(this)
        }
        this.initShow()
        this.schedule(this.changeShow,this.switchTime)
    },

    DIY(params)
    {
        let size = params.size
        let pos = params.position
        this.isVerticle = params.isVerticle
        this.isOffSwitch = params.isOffSwitch//如果设置成true 则该banner由客户端进行控制显示和隐藏,中心化不再控制切换等
        this.switchTime = params.switchTime || 5 //游戏banner切换间隔
        this.switchSpeed = params.switchSpeed || 0.3 //游戏banner切换速度
        this.isSinglePage = params.isSinglePage //如果true 则创建单独不滚动的
        this.singlePageIndex = params.singlePageIndex //单独创建的数据下标

        if (size)
        {
            this.node.width = size.width
            this.node.height = size.height
        }
        if (pos){this.node.position = pos}
    },
    initShow()
    {
        let isLoadOk = YouziData._isDataLoaded
        if (isLoadOk)
        {
            this.freshShow()
        }else
        {
            YouziData._loadedCallBacks.push(this.freshShow.bind(this))
        }
    },

    freshShow()
    {
        if (!this.isSinglePage)
        {
            let data = YouziData.gameBannerDatas[this.updateIndex]
            if (data)
            {
                this.one = this.createBannerAtData(data)
                this.one.position = cc.v2(0,0)
            }
        }else
        {
            let data = YouziData.gameBannerDatas[this.singlePageIndex]
            if (data)
            {
                this.one = this.createBannerAtData(data)
                this.one.position = cc.v2(0,0)
            }
        }
    },

    createBannerAtData(data)
    {
        let self = this
        let node = new cc.Node()
        node.width = this.node.width
        node.height = this.node.height
        this.actionNode.addChild(node)

        let img = node.addComponent(cc.Sprite)
        img.sizeMode = cc.Sprite.SizeMode.CUSTOM
        cc.loader.load(data.bannerImg,function(err,tex)
        {
            if(!self) {
                return
            }
            if(!err){img.spriteFrame=new cc.SpriteFrame(tex);}else{console.error(err);}
        });

        let btn = node.addComponent(cc.Button)
        var event = new cc.Component.EventHandler()
        event.target = this.node
        event.component = "YouziUI_GameBanner"
        event.handler = "touchBanner"
        event.customEventData = JSON.stringify(data)
        btn.clickEvents.push(event)
        return node
    },

    changeShow()
    {
        if (YouziData.gameBannerDatas.length<1)
        {
            return
        }

        this.updateIndex++
        if (this.updateIndex>YouziData.gameBannerDatas.length-1)
        {
            this.updateIndex = 0
        }
        let data = YouziData.gameBannerDatas[this.updateIndex]
        if (data && YouziData.gameBannerDatas.length>1)
        {
            this.two = this.createBannerAtData(data)
            if (this.isVerticle)
            {
                this.two.position = cc.v2(0,-this.node.height)
                let mb1 = cc.moveBy(this.switchSpeed,cc.v2(0,this.node.height))
                let mb2 = cc.moveBy(this.switchSpeed,cc.v2(0,this.node.height))
                let call = cc.callFunc(this.endChange,this)

                this.one.runAction(mb1)
                this.two.runAction(cc.sequence(mb2,call))
            }else
            {
                this.two.position = cc.v2(this.node.width,0)
                let mb1 = cc.moveBy(this.switchSpeed,cc.v2(-this.node.width,0))
                let mb2 = cc.moveBy(this.switchSpeed,cc.v2(-this.node.width,0))
                let call = cc.callFunc(this.endChange,this)

                this.one.runAction(mb1)
                this.two.runAction(cc.sequence(mb2,call))
            }
        }

        if(!this.logged[data.appid])
        {
            this.logged[data.appid] = true
            YouziData.sendExposureLog(data,BI_PAGE_TYPE.GAME)
        }
    },
    endChange()
    {
        this.one.removeFromParent(true)
        this.one = this.two
    },
    touchBanner(event,dataStr)
    {
        let data = JSON.parse(dataStr)
        data.locationIndex = BI_PAGE_TYPE.GAME
        YouziData.startOtherGame(data,null)
    },

    showBanner(){
        if (this.node)
        {
            this.node.active = true
        }
    },
    hideBanner()
    {
        if (this.node)
        {
            this.node.active = false
        }
    },
    destroySelf()
    {
        if (this && this.node)
        {
            this.node.removeFromParent(true)
        }
    },
});
/**
 * 创建底部游戏banner类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateGameBanner(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_GameBanner', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_GameBanner)
            cls.DIY(params)
            if (params.callback){params.callback(node);}
        } catch (error) {
            console.error('YouziCreateGameBanner 生成错误',parentNode,params)
        }
    })
}
