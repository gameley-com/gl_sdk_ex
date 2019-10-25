import { YouziData, BI_PAGE_TYPE } from "./YouziData";

var Youzi_Icon = cc.Class({
    extends: cc.Component,

    properties: { },
    onLoad () {
        this.locationIndex = this.locationIndex || BI_PAGE_TYPE.CUSTOM_COMPONENT
        this.mask = this.node.getChildByName('mask')
        this.iconSp = this.mask.getChildByName('icon').getComponent(cc.Sprite)
        this.redHitNode = this.node.getChildByName('redHit')
        this.nameLabel = this.node.getChildByName('name').getComponent(cc.Label)
    },

    start () {
        let size = this.changeSize
        if (size)
        {
            let design = 130 //设计宽高
            this.node.width = size.width
            this.node.height = size.height
            this.mask.width = size.width
            this.mask.height = size.height
            this.iconSp.node.width = size.width
            this.iconSp.node.height = size.height

            let xScale = size.width / design
            let yScale = size.height / design
            let scale = xScale >= yScale ? yScale : xScale
            this.redHitNode.width = 30*scale
            this.redHitNode.height = 30*scale
            this.nameLabel.node.width = 150*scale
            this.nameLabel.node.height = 32*scale
            this.nameLabel.fontSize = Math.floor(24*scale)
            this.nameLabel.lineHeight = Math.floor(26*scale)
            this.redHitNode.x = this.node.width/2-5
            this.redHitNode.y = this.node.height/2-10
            this.nameLabel.node.y = -(this.node.height/2 + 21*scale)
        }
        if(this.nameClose) { this.nameLabel.node.active = false}
        if (this.changeColor) { this.nameLabel.node.color = this.changeColor}
        if (this.youziData && this.youziData.hotred == 1) { this.redHitNode.active = true}
        this.initShow()
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        this.youziData = params.youziData
        this.locationIndex = params.locationIndex
        this.iconAnimSpeed = params.iconAnimSpeed || 0.6 //动态icon速度值
        this.changeSize = params.size
        let pos = params.position
        this.changeColor = params.nameColor
        this.nameClose = params.nameClose
        this.cancelCallback = params.cancelCallback
        if (pos){this.node.position = pos}
    },

    initShow()
    {
        var self = this
        if (this.youziData)
        {
            if (self.youziData.dynamicType == 1 && this.youziData.dynamicIcon)
            {
                cc.loader.load(this.youziData.dynamicIcon,function(err,tex)
                {
                    if(!self)
                    {
                        return
                    }
                    if (!err)
                    {
                        var frames = []
                        for (let i = 0; i < 4; i++)
                        {
                            for (let j = 0; j < 4; j++)
                            {
                                let frame = new cc.SpriteFrame(tex,cc.rect(j*120,i*120,120,120))
                                frames.push(frame)
                            }
                        }

                        let name = 'anim_icon'+self.youziData.appid;
                        let clip = cc.AnimationClip.createWithSpriteFrames(frames,frames.length);
                        clip.speed = self.iconAnimSpeed
                        clip.name = name;
                        clip.wrapMode = cc.WrapMode.Loop;

                        let anim = self.iconSp.node.getComponent(cc.Animation)
                        anim.addClip(clip);
                        anim.play(name);
                    }
                });
            }
            else
            {
                cc.loader.load(this.youziData.iconImg,function(err,tex){

                    if(!self)
                    {
                        return
                    }
                    if (!err)
                    {
                        if(self.iconSp) {
                            self.iconSp.spriteFrame = new cc.SpriteFrame(tex)
                        }
                    }

                });
            }
            this.nameLabel.string = this.youziData.title
        }else
        {
            console.error('Youzi_Icon数据错误',this.youziData)
        }
    },

    /**
     * 手动 发送该icon的曝光日志
     * 该接口如果是自有推广位的界面(非柚子界面),可以使用
     */
    sendExposureLog()
    {
        YouziData.sendExposureLog(this.youziData,this.locationIndex)
    },

    touchIconClick()
    {
        this.redHitNode.active = false
        this.youziData.locationIndex = this.locationIndex
        console.log('touchIconClick',this.youziData)
        YouziData.startOtherGame(this.youziData,null, this.cancelCallback)
    }
});

/**
 * 根据BI_PAGE_TYPE创建对应的icon组
 * @param {BI_PAGE_TYPE} pageType 类型枚举
 * @param {object} params DIY参数 详见开发文档
 * @param {function} callback 回调函数 会将创建好的icon以Array<cc.Node>形式作为参数返回
 */
export function YouziCreateIcons(pageType,params,callback) {
    try {
        params = params || {}
        let nodes = []
        cc.loader.loadRes('youzi/prefabs/Youzi_Icon', function (err, prefab)
        {
            if(YouziData._isDataLoaded) {
                let datas = YouziData.getDatasByBIType(pageType)
                for (let i = 0; i < datas.length; i++)
                {
                    let data = datas[i];
                    let node = cc.instantiate(prefab)
                    node.position = cc.v2(0,0)
                    node.name = data.appid
                    let cls = node.getComponent(Youzi_Icon)
                    params.youziData = data
                    params.locationIndex = pageType
                    cls.DIY(params)
                    nodes.push(node)
                }
                if(callback) callback(nodes);
            }else
            {
                console.warn('获得中心化数据失败,或中心化数据下行未完成 无法创建Icon');
                if(callback) callback([]);
            }
        });
    } catch (error) {
        console.error('YouziCreateIcon 生成错误',parentNode,params);
        if(callback) callback([]);
    }
};
