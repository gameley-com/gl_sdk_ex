import { YouziData, BI_PAGE_TYPE , BANNER_TYPE } from "./YouziData";
import { Youzi } from "../Youzi";

export var WECHAT_BANNER_POSTYPE=
{
    BOTTOM:1,   //banner放在底部
    TOP:2       //banner放在顶部
};
export class Youzi_WechatBanner
{
    /**
     * 创建微信banner
     * @param {string} wechatBannerID 微信bannerID
     * @param {WECHAT_BANNER_POSTYPE} posType  微信banner放置位置类型
     * @param {cc.Vec2} offset 微信banner位置偏移量默认0,0
     * @param {bool} isOffSwitch 如果设置成true 则该banner由客户端进行控制显示和隐藏,中心化不再控制切换等
     * @param {bool} isOffSwitchSelf //是否微信banner不自动更换内容。(设置true后,交由客户端自己调用switchBannerNow进行更换自身显示内容)
     */
    constructor(wechatBannerID,posType=null,offset=null,isOffSwitch=false,isOffSwitchSelf=false)
    {
        this.adUnitId = wechatBannerID
        this.posType = posType || 1
        this.offset = offset || cc.v2(0,0)
        this.bannerType = BANNER_TYPE.WX
        this.isShowBanner = false
        this.isOffSwitch = isOffSwitch//是否交由中心化切换显示隐藏
        this.isOffSwitchSelf = isOffSwitchSelf
        this.initShow()
    }

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
    }

    freshShow()
    {
        this.createWXBanner()
        if(!this.isOffSwitch)
        {
            //记录 交由中心化切换显示隐藏
            YouziData.addBanner(this)
            this._autoSwitchSelf()
        }
    }
    createWXBanner()
    {
        if(!window.wx)
        {
            return;
        }else if(!wx.createBannerAd)
        {
            return;
        }

        let self = this
        let screenWidth = wx.getSystemInfoSync().screenWidth
        let screenHeight = wx.getSystemInfoSync().screenHeight
        let designSize = cc.view.getDesignResolutionSize()

        let rateHeight = (screenWidth / designSize.width) * designSize.height
        let minHeight = 100 *(screenWidth / designSize.width)  + (screenHeight - rateHeight) /2
        
        let oldBannerAd = this.bannerAd
        let bannerAd = wx.createBannerAd({
            adUnitId: this.adUnitId,
            style: {
                left: this.offset.x,
                top:  this.offset.y,
                width: screenWidth,
            }
        })

        let isSetWidth = false
        bannerAd.onResize(res => {
            if (isSetWidth)
            {
                return
            }
            if (bannerAd.style.realHeight > minHeight)
            {
                isSetWidth = true
                let width = screenWidth * minHeight / bannerAd.style.realHeight
                width = cc.misc.clampf(width,300,9999)

                bannerAd.style.width = width
                bannerAd.style.top = screenHeight - bannerAd.style.realHeight * (width / bannerAd.style.realWidth) + self.offset.y
                bannerAd.style.left = (screenWidth - bannerAd.style.width) /2  + self.offset.x
            }else 
            {
                bannerAd.style.top = screenHeight - bannerAd.style.realHeight + self.offset.y
                if (screenHeight/screenWidth>2)
                {
                    bannerAd.style.top = bannerAd.style.top -34 + self.offset.y
                }
            }

            if (self.posType == WECHAT_BANNER_POSTYPE.TOP)
            {
                bannerAd.style.left = (screenWidth - bannerAd.style.width) /2 + self.offset.x
                bannerAd.style.top = self.offset.y
                if (screenHeight/screenWidth>2)
                {
                    bannerAd.style.top += 76
                }else if(screenWidth/screenHeight>2)
                {
                    bannerAd.style.top += 76
                }
            }
        })

        bannerAd.onLoad((res)=>{
            if (oldBannerAd)
            {
                oldBannerAd.hide();
                oldBannerAd.destroy()
            }

            if(self.isShowBanner)
            {
                bannerAd.show()
            }else
            {
                bannerAd.hide()
            }
        })

        bannerAd.onError((err)=>{
            console.warn('微信banner出错',err)
        })
        this.bannerAd = bannerAd;
        
    }

    showBanner()
    {
        this.isShowBanner = true
        if (this.bannerAd)
        {
            this.bannerAd.show()
        }
    }
    hideBanner()
    {
        this.isShowBanner = false
        if (this.bannerAd)
        {
            this.bannerAd.hide()
        }
    }
    destroySelf()
    {
        if (this.bannerAd)
        {
            this.bannerAd.destroy()
            this.bannerAd = null
        }
        if (this.refreshTimer)
        {
            clearInterval(this.refreshTimer)
            this.refreshTimer = null
        }
        this.isShowBanner = false
    }

    /**
     * 立即切换微信banner自身的展示内容
     */
    switchBannerNow()
    {
        if (this.refreshTimer)
        {
            clearInterval(this.refreshTimer)
            this.refreshTimer = null
        }
        this.createWXBanner()
        this._autoSwitchSelf()
    }

    _autoSwitchSelf()
    {
        if(!this.isOffSwitchSelf)
        {
            var self = this
            this.refreshTimer = setInterval(() => {
                self.createWXBanner()
            }, YouziData._bannerCreateInterval*1000);
        }
    }
}
