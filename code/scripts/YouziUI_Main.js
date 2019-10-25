import { YouziData, BI_PAGE_TYPE } from "./YouziData";

/**
 * 中心化UI 主推界面
 */
var YouziUI_Main = cc.Class({
    extends: cc.Component,
    properties:{},
    onLoad()
    {
        this.updateIndex = 0
        this.btnNode = this.node.getChildByName('btn')
        this.bg = this.btnNode.getChildByName('bg')
        this.iconSprite = this.btnNode.getChildByName('mask').getChildByName('icon').getComponent(cc.Sprite)
        this.nameLabel = this.btnNode.getChildByName('nameLabel').getComponent(cc.RichText)
        this.loged = []
    },

    start()
    {
        this.initShow()
        if(!this.isCreateMultipleMain) {
            this.schedule(this.freshShow,5)
        }
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        let size = params.size
        let pos = params.position
        let bgColor = params.bgColor
        this.nameColor = params.nameColor
        let actionClose = params.actionClose
        let action = params.action
        this.iconAnimSpeed = params.iconAnimSpeed || 0.2
        // 是否创建多个主推
        this.isCreateMultipleMain = params.isCreateMultipleMain
        // 创建多个主推时，主推的icon index，初始加载时，会用到
        this.mainIconIndex = params.mainIconIndex
        //TODO:bg隐藏 文字隐藏
        if (pos) { this.node.position = pos }
        if (bgColor) { this.bg.color = bgColor}
        this.initAction(action,actionClose)

        if (size && size.width && size.height)
        {
            this.node.scaleX = size.width / 104
            this.node.scaleY = size.height / 130
        }
        if(params.moreGameNode) {
            this.cancelCallback = function() {
                if (params.moreGameNode && params.moreGameNode.openYouziMoreGame) {
                    params.moreGameNode.openYouziMoreGame()
                }
            }
        }
    },
    initAction(action,actionClose)
    {
        if (!actionClose)
        {
            if (action)
            {
                this.node.runAction(action)
            }else
            {
                let rep = cc.repeatForever(cc.sequence(cc.rotateTo(2,-10),cc.rotateTo(2,10)))
                this.node.runAction(rep)
            }
        }
    },
    initShow()
    {
        let self = this
        let isLoadOk = YouziData._isDataLoaded
        if (isLoadOk)
        {
            if(self.isCreateMultipleMain) {
                self.updateMultipleMain(self.mainIconIndex)
            } else {
                this.freshShow()
            }
        }else
        {
            if(self.isCreateMultipleMain) {
                self.updateMultipleMain(self.mainIconIndex)
            } else {
                YouziData._loadedCallBacks.push(self.freshShow.bind(self))
            }
        }
    },

    updateMultipleMain(index) {
        var self = this
        let data = YouziData.mainRecDatas[index]
        self.loadIcon(data)
    },

    loadIcon(data) {
        let self = this
        if (data && self && self.iconSprite)
        {
            let anim = self.iconSprite.node.getComponent(cc.Animation)
            let clips = anim.getClips()
            if (clips.length>0)
            {
                anim.stop(clips[0].name)
            }

            this.curData = data
            this.btnNode.active = true//显示整个主推按钮

            if (data.dynamicType == 1 && data.dynamicIcon)
            {
                cc.loader.load(data.dynamicIcon,function(err,tex)
                {
                    if(!self)
                    {
                        return
                    }

                    if (!err && self.iconSprite)
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

                        let name = 'anim_icon'+data.appid;
                        let clip = cc.AnimationClip.createWithSpriteFrames(frames,frames.length);
                        clip.speed = self.iconAnimSpeed
                        clip.name = name;
                        clip.wrapMode = cc.WrapMode.Loop;

                        let anim = self.iconSprite.node.getComponent(cc.Animation)
                        anim.addClip(clip);
                        anim.play(name);
                    }
                });
            }
            else
            {
                cc.loader.load(data.iconImg,function(err,tex){
                    if(!self)
                    {
                        return
                    }

                    if (!err && self.iconSprite)
                    {
                        self.iconSprite.spriteFrame = new cc.SpriteFrame(tex)
                    }
                });
            }

            self.nameLabel.string = '<b>'+data.slogan+'</b>'
            if (self.nameColor)
            {
                self.nameLabel.string = `<color=${this.nameColor}>${self.nameLabel.string}</c>`
            }else
            {
                self.nameLabel.string = `<color=#000000>${self.nameLabel.string}</c>`
            }

            if(!this.loged[data.appid])
            {
                this.loged[data.appid] = true
                YouziData.sendExposureLog(data,BI_PAGE_TYPE.MAIN)
            }
        }
    },

    freshShow()
    {
        var self = this
        let data = YouziData.mainRecDatas[this.updateIndex]

        self.loadIcon(data)

        this.updateIndex++
        if (this.updateIndex>YouziData.mainRecDatas.length-1)
        {
            this.updateIndex = 0
        }
    },

    onJumpBtnClick()
    {
        if (this.curData)
        {
            this.curData.locationIndex = BI_PAGE_TYPE.MAIN
            YouziData.startOtherGame(this.curData,null, this.cancelCallback)
            // 创建多个主推时，不走这个方法
            if(!this.isCreateMultipleMain) {
                this.unschedule(this.freshShow)
                this.schedule(this.freshShow,5)
                this.freshShow()
            }
        }
    },
});

/**
 * 创建主推类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateMain(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_Main', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_Main)
            cls.DIY(params)
            if (params.callback){params.callback(node);}
            if(params.isCreateMultipleMain) {
                parentNode.updateMultipleMain = cls.updateMultipleMain.bind(cls)
            }
        } catch (error) {
            console.error('YouziCreateMain 生成错误',parentNode,params);
        }
    })

};
