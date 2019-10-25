import {YouziData} from './YouziData';

var YouziUI_ScreenPage =cc.Class({
  extends: cc.Component,

  properties: {},
  onLoad () {
    this.luodiNode = this.node.getChildByName('LuoDi')
    this.luodiSmallImg = this.luodiNode.getChildByName('Small').getComponent(cc.Sprite)
    this.luodiBigImg = this.luodiNode.getChildByName('Big').getComponent(cc.Sprite)
    this.luodiBtn = this.luodiNode.getComponent(cc.Button)
  },

  start ()
  {
    let size = cc.view.getVisibleSize()
    this.luodiBigImg.node.width = size.width
    this.luodiBigImg.node.height = size.height
    this.luodiNode.width = size.width
    this.luodiNode.height = size.height
    this.initShow()
  },

    loadErrHandle() {
        let self = this
        let info = {}

        console.log('launch---'+JSON.stringify(self.launch))
        if(self.launch.query && self.launch.query.anChannelId)
        {
            info.anChannelId = self.launch.query.anChannelId
            info.ioChannelId = self.launch.query.ioChannelId
        }
        if(self.launch.referrerInfo && self.launch.referrerInfo.extraData && self.launch.referrerInfo.extraData.togame)
        {
            info.appid = self.launch.referrerInfo.extraData.togame
            this.luodiInfo = info
            console.log('jump info--'+info)
            self.luodiNode.active = true
        } else {
            self.goGame()
        }

    },

  /**
   * DIY节点
   * @param {object} params
   */
  DIY(params)
  {
    this.gameSceneName = params.gameSceneName
    this.launch = params.launch
    this.customEnterGame = params.customEnterGame
  },

  initShow()
  {
    //落地页按钮点击
    var e = new cc.Component.EventHandler()
    e.target = this.node
    e.component = "YouziUI_ScreenPage"
    e.handler = "btnLuoDiClick"
    this.luodiBtn.clickEvents.push(e)

    let isLoadOk = YouziData._isDataLoaded
    if (isLoadOk)
    {
      this.freshShow()
    }else
    {
      YouziData._loadedCallBacks.push(this.freshShow.bind(this))
      if(YouziData._isLoadFinish) {
          this.loadErrHandle()
      } else {
          console.log('add err callback to list')
          YouziData._requestErrorCbs.push(this.loadErrHandle.bind(this))
      }
    }
  },

  freshShow()
  {
    var self = this
    if (typeof wx !== 'undefined')
    {
      if (this.launch)
      {
        YouziBoxManager.wxLaunch(this.launch)
        this.initUI(this.launch)
      }

      let cb = function(res)
      {
        YouziBoxManager.wxOnShow(res)
        self.initUI(res)
      }
      wx.onShow(cb)
    }else
    {
      this.goGame()
    }
  },

  initUI(launch)
  {
    let togameAppId = YouziBoxManager.referrerInfo.togame
    if(togameAppId)
    {
      let data = YouziData.getDataFromAllGameObj(togameAppId)
      if (data)
      {
        this.luodiInfo = data
        //合并从推广游戏跳进普通盒子的游戏来源渠道
        if(launch.query &&launch.query.anChannelId)
        {
          this.luodiInfo.anChannelId = launch.query.anChannelId
          this.luodiInfo.ioChannelId = launch.query.ioChannelId
        }
        this.showLuoDi(data.newPush,data.iconImg)
      }else
      {
        console.log('没发现落地页data',togameAppId)
        this.goGame()
      }
    }else
    {
      console.log('没发现落地页appid')
      this.goGame()
    }
  },

  //显示落地页
  showLuoDi(bigUrl,smallUrl)
  {
    var self = this
    if (bigUrl)
    {
      cc.loader.load(bigUrl,function(err,tex){
        if(!self)
        {
          return
        }

        if(!err && self.luodiBigImg && self.luodiNode)
        {
          self.luodiBigImg.spriteFrame = new cc.SpriteFrame(tex)
          self.luodiNode.active = true
          //落地页展示日志
          YouziBoxManager.sendBox2Open()
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

        if(!err && self.luodiSmallImg && self.luodiNode )
        {
          self.luodiSmallImg.spriteFrame = new cc.SpriteFrame(tex)
          self.luodiNode.active = true
          //落地页展示日志
          YouziBoxManager.sendBox2Open()
        }else
        {
          self.closeLuoDi()
        }
      })
    }else
    {
      self.closeLuoDi()
    }


  },
  //点击落地页
  btnLuoDiClick()
  {
    var self = this
    let info = this.luodiInfo
    console.log('点击落地页 即将跳转:',info.appid)
    let cb = function(res)
    {
      self.closeLuoDi()
    }
    YouziBoxManager.navigateToOtherGame(info,cb)
  },

  closeLuoDi()
  {
    if(this.luodiNode) {
        this.luodiNode.active = false
    }
    this.goGame()
  },

  goGame()
  {
    if(this.customEnterGame){
      this.customEnterGame();
    }else{
      if (this.gameSceneName)
      {
        console.log('盒子页完毕=>跳转到场景',this.gameSceneName)
        cc.director.loadScene(this.gameSceneName)
      }
    }
  },
});
/**
 * 创建普通盒子类型的中心化
 * @param {cc.Node} parentNode 父节点
 * @param {object} params DIY参数
 * params.launch微信启动参数 如果传入 则代表立刻展示盒子 如果不传入则代表等待wx.onShow再展示盒子
 * params.gameSceneName要跳转的场景名称 如果传入则代表盒子关闭时需要跳转场景
 * params.customEnterGame游戏自行跳转场景,如果传入此参数则无论是否有传入场景名都交由游戏自行跳转
 */
export function YouziCreateScreenPage(parentNode,params) {
    cc.loader.loadRes('youzi/prefabs/YouziUI_ScreenPage', function (err, prefab)
    {
        try {
            params = params || {}
            let node = cc.instantiate(prefab)
            node.position = cc.v2(0,0)
            parentNode.addChild(node)
            let cls = node.getComponent(YouziUI_ScreenPage)
            cls.DIY(params)
            if (params.callback){params.callback(node);}
        } catch (error) {
            console.error('YouziCreateScreenPage 生成错误',parentNode,params);
        }
    })
};
