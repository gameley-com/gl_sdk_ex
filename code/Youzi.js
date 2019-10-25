import { YouziData } from "./scripts/YouziData";
import { YouziCreateMain } from './scripts/YouziUI_Main';
import { YouziCreateFloat } from "./scripts/YouziUI_Float";
import { YouziCreateFloatBtn } from "./scripts/Youzi_FloatBtn";
import { YouziCreateMoreGame } from "./scripts/YouziUI_MoreGame";
import { YouziCreateMoreGameBtn } from "./scripts/Youzi_MoreGameBtn";
import { YouziCreateGuess } from "./scripts/YouziUI_Guess";
import { YouziCreateMatrix } from "./scripts/YouziUI_Matrix";
import { YouziCreateGameBanner } from "./scripts/YouziUI_GameBanner";
import { Youzi_WechatBanner } from "./scripts/Youzi_WechatBanner";
import { YouziCreateOffline } from "./scripts/YouziUI_Offline";
import { YouziCreateBox } from "./scripts/YouziUI_Box";
import { YouziCreateIcons } from "./scripts/Youzi_Icon";
import { YouziCreateScreenPage } from "./scripts/YouziUI_ScreenPage";
import { YouziCreateSmallMatrixWall } from "./scripts/YouziUI_SmallMatrixWall";
import { YouziCreateMultipleMain } from "./scripts/Youzi_MultipleMain";

export var Youzi=
    {
        /**
         * 中心化初始化函数 调用一次即可
         * @param {string} appid 渠道提供的appid
         * @param {string} resVersion 中心化资源版本 默认'1.00.00'
         * @param {number} channelId 管理后台提供的平台渠道 默认1002微信
         */
        init(appid, resVersion, channelId)
        {
            YouziData.init(appid, resVersion, channelId);
        },

        /**
         * 创建主推类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_Main(parentNode,params={})
        {
            this._createMoreAfterCancel(parentNode, params)
            YouziCreateMain(parentNode,params);
        },


        /**
         * 一次创建多个主推
         * @param parentNodes 主推节点数组，比如[node1, node2, node3]
         * @param params 参数数组，每个主推可以自定义的一些参数，详情请看单个主推的创建
         * @param moreGameNode 点击主推取消跳转后，弹出的矩阵墙所在节点
         * @return {MultipleMain}
         */
        createYouziUI_MultipleMain(parentNodes, params, moreGameNode) {
            return YouziCreateMultipleMain(parentNodes, params, moreGameNode)
        },

        /**
         * 创建抽屉入口按钮
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouzi_FloatBtn(parentNode,params={})
        {
            YouziCreateFloatBtn(parentNode,params)
        },

        /**
         * 创建抽屉类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         * @param {cc.Node} moreGameNode 矩阵墙节点，用于取消跳转时，显示矩阵墙，不传的话不会显示矩阵墙
         */
        createYouziUI_Float(parentNode,params={},moreGameNode)
        {
            if(moreGameNode) {
                if(!params) {
                    params = {}
                }
                params.moreGameNode = moreGameNode
                let params1 = Object.create(params)
                this._createMoreAfterCancel(moreGameNode, params1)

            }
            YouziCreateFloat(parentNode,params);
        },

        /**
         * 创建矩阵墙入口按钮
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouzi_MoreGameBtn(parentNode,params={})
        {
            YouziCreateMoreGameBtn(parentNode,params)
        },

        /**
         * 创建矩阵墙类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_MoreGame(parentNode,params={})
        {
            YouziCreateMoreGame(parentNode,params);
        },

        /**
         * 创建矩阵小banner类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_Guess(parentNode,params={})
        {
            this._createMoreAfterCancel(parentNode, params)
            YouziCreateGuess(parentNode,params);
        },

        _createMoreAfterCancel(parentNode, params) {
            params.moreGameNode = parentNode
            let params1 = {
                isShowNow: false,
                cancelCallback: true
            }
            YouziCreateMoreGame(parentNode,params1);
        },

        /**
         * 创建底部矩阵Banner类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_Matrix(parentNode,params={})
        {
            this._createMoreAfterCancel(parentNode, params)
            YouziCreateMatrix(parentNode,params);
        },

        /**
         * 创建底部游戏Banner类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_GameBanner(parentNode,params={})
        {
            YouziCreateGameBanner(parentNode,params);
        },

        /**
         * 创建微信banner
         * @param {string} wechatBannerID 微信bannerid
         * @param {WECHAT_BANNER_POSTYPE} posType 位置类型 1底部 2顶部
         * @param {cc.Vec2} offset 距离设置的位置偏移值
         * @param {bool} isOffSwitch 如果设置成true 则该banner由客户端进行控制显示和隐藏,中心化不再控制切换等
         * @param {bool} isOffSwitchSelf //是否微信banner不自动更换内容。(设置true后,交由客户端自己调用switchBannerNow进行更换自身显示内容)
         */
        createYouziUI_WechatBanner(wechatBannerID,posType=null,offset=null,isOffSwitch=false,isOffSwitchSelf=false)
        {
            return new Youzi_WechatBanner(wechatBannerID,posType,offset,isOffSwitch,isOffSwitchSelf)
        },

        /**
         * 创建离线Banner类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数 详见开发文档
         */
        createYouziUI_Offline(parentNode,params={})
        {
            YouziCreateOffline(parentNode,params);
        },

        /**
         * 自由推广Icons获取
         * @param {BI_PAGE_TYPE} pageType  以下枚举
         * MAIN:1,        //主推
         * FLOAT:2,      //抽屉
         * MATRIX:3,     //矩阵banner
         * GUESS:4,      //矩阵小banner
         * MORE:5,       //矩阵墙
         * GAME:6,       //游戏banner
         * OFFLINE:7,    //离线banner
         * BUY_Screen:8, //买量-落地页
         * BUY_BOX:9     //买量-盒子页
         * @param {object} params
         * @param {function} callback
         */
        createYouziIcons(pageType,params,callback)
        {
            YouziCreateIcons(pageType,params,callback)
        },

        /**
         * 创建买量盒子类型中心化推广位
         * @param {cc.Node} parentNode 父节点
         * @param {object} params DIY参数
         *                       params.gameSceneName要跳转的场景名称 如果传入则代表盒子关闭时需要跳转场景
         */
        createYouziUI_Box(parentNode,params={})
        {
            YouziCreateBox(parentNode,params);
        },

        /**
         * 创建普通盒子类型中心化推广位
         * @param {*} parentNode 父节点
         * @param {*} params DIY参数
         * params.launch微信启动参数 如果传入 则代表立刻展示盒子 如果不传入则代表等待wx.onShow再展示盒子
         * params.gameSceneName要跳转的场景名称 如果传入则代表盒子关闭时需要跳转场景
         * params.customEnterGame游戏自行跳转场景,如果传入此参数则无论是否有传入场景名(gameSceneName)都交由游戏自行跳转
         */
        createYouziUI_ScreenPage(parentNode,params={})
        {
            YouziCreateScreenPage(parentNode,params);
        },

        /**
         * 创建小矩阵墙
         * @param parentNode 父节点
         * @param params 参数{ isVerticle: false }  isVerticle：true表示竖屏，false表示横屏
         */
        createYouziUI_SmallMatrixWall(parentNode,params={}) {
            YouziCreateSmallMatrixWall(parentNode, params)
        }
    };
window.Youzi = Youzi;
