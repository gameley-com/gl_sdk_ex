import { YouziData, BI_PAGE_TYPE } from "./YouziData";

var YouziUI_Box = cc.Class({
    extends: cc.Component,

    properties: {
        mainCellPrefab:{
            type:cc.Prefab,
            default:null
        },
        hotCellPrefab:{
            type:cc.Prefab,
            default:null
        }
    },
    onLoad()
    {
        this.main=[]
        this.hot=[]
        this.buy=[]
        this.BILOG_GROUP = 99 //BI打点组ID
        this.gameSceneName = null
        this.boxNode = this.node.getChildByName('Box')
        this.luodiNode = this.node.getChildByName('LuoDi')
        this.startBtnNode = this.luodiNode.getChildByName('startButton')
        this.luodiSmallImg = this.luodiNode.getChildByName('Small').getComponent(cc.Sprite)
        this.luodiBigImg = this.luodiNode.getChildByName('Big').getComponent(cc.Sprite)
        this.boxSrc = this.boxNode.getChildByName('ScrollView').getComponent(cc.ScrollView)
        this.closeLuoDiBtn = this.luodiNode.getChildByName('closeButton').getComponent(cc.Button)
        this.luodiBtn = this.luodiNode.getComponent(cc.Button)
    },

    start()
    {
        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:1 })//加载页展示
        this.initShow()
    },
    /**
     * DIY节点
     * @param {object} params
     */
    DIY(params)
    {
        this.gameSceneName = params.gameSceneName
    },

    initShow()
    {   //取消落地页按钮
        var event1 = new cc.Component.EventHandler()
        event1.target = this.node
        event1.component = "YouziUI_Box"
        event1.handler = "closeLuoDi"
        this.closeLuoDiBtn.clickEvents.push(event1)

        //落地页按钮点击
        var e = new cc.Component.EventHandler()
        e.target = this.node
        e.component = "YouziUI_Box"
        e.handler = "btnLuoDiClick"
        this.luodiBtn.clickEvents.push(e)

        let isLoadOk = YouziData._isDataLoaded
        if (isLoadOk)
        {
            this.loadDataBI()
            this.freshShow()
        }else
        {
            YouziData._loadedCallBacks.push(this.freshShow.bind(this))
        }
    },

    loadDataBI()
    {
        if (!(YouziData.hotListDatas.length > 0 || YouziData.moreDatas.length > 0 ||  YouziData.matrixBannerDatas.length > 0) && YouziData.mainRecDatas.length<=0)
        {
            YouziData.BI_AppOnce({actionNumber:1006})
            YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:10 })//由于 中心化下行网络失败 进入游戏
            this.goGame()
        }else
        {
            YouziData.BI_AppOnce({actionNumber:1005})
            YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:3 })//中心化下行网络成功
        }
    },

    freshShow()
    {
        this.loadDataBI()
        var self = this
        if (typeof wx !== 'undefined')
        {
            let launch = wx.getLaunchOptionsSync()
            YouziBoxManager.wxLaunch(launch)
            this.initUI(launch)

            let cb = function(res)
            {
                YouziBoxManager.wxOnShow(res)
                self.initUI(res)
            }
            wx.onShow(cb)
        }else
        {
            YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:15 })//进入游戏
            this.goGame()
        }
    },

    initUI(launch)
    {
        //初始化UI
        this.startBtnNode.active = false
        this.boxSrc.content.removeAllChildren(true)

        console.log('微信启动参数',launch)
        if (launch.query && launch.query.adChannelId)
        {
            this.getRecommend(true)
        }else if (launch.referrerInfo && launch.referrerInfo.extraData && launch.referrerInfo.extraData.adChannelId)
        {
            this.getRecommend(true)
        }else
        {
            this.getRecommend(false)
        }
    },
    getRecommend(isAdChannel)
    {
        //分省
        if (YouziData._provinceAllow == 0)
        {
            YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:11 })//由于分省控制 进入游戏
            this.goGame()
            return
        }else
        {
            YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:4 })//非分省控制用户
            //非分省 判断是不是老用户  0新用户 1中心化用户  2游戏用户
            let userType = wx.getStorageSync('userType') || 0
            if (userType == 0)
            {
                if (isAdChannel)
                {
                    YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:5 })//玩家初始是中心化用户
                    wx.setStorageSync('userType',1)
                }else
                {
                    YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:12 })//玩家初始是游戏用户 进入游戏
                    wx.setStorageSync('userType',2)
                    wx.setStorageSync('inTimes',1)
                    this.goGame()
                    return
                }
            }else if(userType == 1)
            {
                //中心化用户再次进入游戏
                YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:17 })
            }else if(userType == 2)
            {
                if (isAdChannel)
                {
                    YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:18 })//玩家改为中心化用户
                    wx.setStorageSync('userType',1)
                }else
                {
                    //玩家依然是游戏用户
                    //判断进入几次游戏
                    let inTimes = wx.getStorageSync('inTimes') || 0
                    inTimes = inTimes + 1
                    wx.setStorageSync('inTimes',inTimes)

                    //前两次 直接进游戏 防审
                    if (inTimes<3)
                    {
                        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:13 })//无启动参数 前两次直接进游戏
                        this.goGame()
                        return
                    }else
                    {
                        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:16 })//无启动参数 进入游戏超过三次 改为中心化用户
                        wx.setStorageSync('userType',1)
                    }
                }
            }else
            {
                YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:14 })//未知用户 进入游戏
                this.goGame()
                return
            }
        }

        this.main = YouziData.mainRecDatas
        this.hot = YouziData.hotListDatas
        this.buy = YouziData.buyListDatas
        console.log('主推',this.main)
        console.log('热游',this.hot)
        console.log('买量',this.buy)

        if (this.buy.length>0 && isAdChannel)
        {
            let data = this.buy[0]
            let img = data.newPush || data.iconImg
            this.luodiBigImg.node.active = data.newPush
            this.luodiSmallImg.node.active = data.iconImg
            this.startBtnNode.active = this.luodiSmallImg.node.active

            this.luodiInfo = data
            if(img)
            {
                this.showLuoDi(data.newPush,data.iconImg)
            }else
            {
                //显示九宫中心化
                this.showJiuGong(this.main,this.hot)
            }
        }else
        {
            this.luodiNode.active = false
            //显示九宫中心化
            this.showJiuGong(this.main,this.hot)
        }
    },

    //显示落地页
    showLuoDi(bigUrl,smallUrl)
    {
        var self = this
        if(bigUrl)
        {
            cc.loader.load(bigUrl,function(err,tex){
                if(!self)
                {
                    return
                }

                if(!err)
                {
                    self.luodiBigImg.spriteFrame = new cc.SpriteFrame(tex)
                    self.luodiNode.active = true
                }
                else
                {
                    self.closeLuoDi()
                }
            })
        }else if(smallUrl)
        {
            cc.loader.load(smallUrl,function(err,tex){
                if(!self)
                {
                    return
                }

                if(!err)
                {
                    self.luodiSmallImg.spriteFrame = new cc.SpriteFrame(tex)
                    self.luodiNode.active = true
                }else
                {
                    self.closeLuoDi()
                }
            })
        }else
        {
            self.closeLuoDi()
        }

        //落地页展示日志
        YouziBoxManager.sendBox2Open()
        //落地页流失打点
        YouziData.BI_AppOnce({actionNumber:1003})
        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:6 })
    },

    //显示盒子页
    showJiuGong(main,hot)
    {
        let mainCount = main.length /2
        for (let i = 0; i < mainCount; i++)
        {
            let data1 = main[2*i+0]
            let data2 = main[2*i+1]

            let node = cc.instantiate(this.mainCellPrefab)
            this.boxSrc.content.addChild(node)
            let node1 = node.getChildByName('1')
            let node2 = node.getChildByName('2')

            this.loadCell(data1,node1)
            this.loadCell(data2,node2)
        }

        let hotCount = hot.length /3
        for (let i = 0; i < hotCount; i++)
        {
            let data1 = hot[3*i+0]
            let data2 = hot[3*i+1]
            let data3 = hot[3*i+2]

            let node = cc.instantiate(this.hotCellPrefab)
            this.boxSrc.content.addChild(node)
            let node1 = node.getChildByName('1')
            let node2 = node.getChildByName('2')
            let node3 = node.getChildByName('3')

            this.loadCell(data1,node1)
            this.loadCell(data2,node2)
            this.loadCell(data3,node3)
        }
        console.log('成功展示了盒子页面')
        //盒子页显示流失打点
        YouziData.BI_AppOnce({actionNumber:1004})
        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:7 })
    },

    loadCell(data,node)
    {
        let self = this
        if (!data)
        {
            return
        }
        let btn = node.getComponent(cc.Button)
        let sp = node.getChildByName('Icon').getComponent(cc.Sprite)
        let nameLabel = node.getChildByName('Name').getComponent(cc.Label)

        var event1 = new cc.Component.EventHandler()
        event1.target = this.node
        event1.component = "YouziUI_Box"
        event1.handler = "touchBoxIconClick"
        event1.customEventData = JSON.stringify(data)
        btn.clickEvents.push(event1)

        cc.loader.load(data.newIcon,function(err,tex){
            if(!self) {
                return
            }
            if(!err)
            {
                sp.spriteFrame = new cc.SpriteFrame(tex)
            }
        })
        nameLabel.string = data.title
        //曝光日志
        YouziBoxManager.sendExposureLog(data,1)
    },

    //点击落地页
    btnLuoDiClick()
    {
        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:8 })
        var self = this
        let info = this.luodiInfo
        console.log('点击落地页 即将跳转:',info.appid)
        let cb = function(res)
        {
            self.closeLuoDi()
        }
        info.locationIndex = BI_PAGE_TYPE.BUY_Screen
        YouziBoxManager.navigateToOtherGame(info,cb)
    },

    //点击盒子上的icon
    touchBoxIconClick(event,dataStr)
    {
        YouziData.BI_Action({ actionType:this.BILOG_GROUP,actionNumber:9 })
        let data = JSON.parse(dataStr)
        console.log('点击了盒子icon',data.appid)
        data.locationIndex = BI_PAGE_TYPE.BUY_BOX
        YouziData.navigateToOtherGame(data)
    },

    closeLuoDi()
    {
        this.luodiNode.active = false
        this.boxSrc.content.removeAllChildren(true)
        this.showJiuGong(this.main,this.hot)
    },

    goGame()
    {
        if (this.gameSceneName)
        {
            console.log('盒子页完毕=>跳转到场景',this.gameSceneName)
            cc.director.loadScene(this.gameSceneName)
        }
    },
});

/**
 * 创建盒子类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数 详见开发文档
 */
export function YouziCreateBox(parentNode,params) {
    try {
        cc.loader.loadRes('youzi/prefabs/YouziUI_Box', function (err, prefab)
        {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_Box)
            cls.DIY(params)
            if (params.callback){params.callback(node);}
        });
    } catch (error) {
        console.error('YouziCreateBox 生成错误',parentNode,params);
    }
};
