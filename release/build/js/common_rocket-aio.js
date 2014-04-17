/**
 * rocket根命名空间
 */
(function($) {

window.rocket = window.rocket || {};

})(Zepto);




;
/**
 * View基类，控制展现逻辑，充当控制器的角色
 */
(function($) {

rocket.baseview = Backbone.View.extend({
    events: {}

    // 子类入口，子类可重写
    ,init: function(options) {}

    // 初始化函数
    // @todo: view properties or methods will probably be overwritten 
    ,initialize: function(options, parentView){
        var me = this;

        // 初始化选项
        me.options = options || {__empty: true};

        // 父级view
        me.parent = parentView || null;

        // subview列表
        me.children = {};

        // subview数
        me.length = 0;

        // 页面事件中心
        me.ec = me.getRoot();
        
        // 子页面事件中心
        me.subec = me.getSubEC();

        // 特征字符串，框架默认提供的view标识
        me.featureString = me.getFeatureString();

        // loading元素
        // 全局loading
        me.$globalLoading = rocket.$globalLoading;
        // 页面loading
        me.$pageLoading = rocket.$pageLoading;

        // 页面方向
        me.pageOrientation 
            = me.pageOrientationToBe
            = window.orientation;

        // 子类初始化方法
        me.init(me.options);

        // 事件注册
        me._registerEvents();
        me.registerEvents();
    }

    // 获取根view
    ,getRoot: function(){
        var me = this, p, c;
        p = c = me;

        while(p){
            c = p;
            p = p.parent;
        }
        return c;
    }

    // 获取子页面事件中心，若无子页面，等同于ec
    ,getSubEC: function(){
        var me = this, p, c;
        p = c = me;

        while(p){
            if(p instanceof rocket.subpageview){
                return p;
            }
            c = p;
            p = p.parent;
        }
        return c;
    }

    /**
     * 获取特征字符串，用于系统内部区分标识view
     * @todo: 调用频次很高，需要注意其计算性能
     */
    ,getFeatureString: function(options){
        var me = this,
            opt = options || me.options,
            ft = '';

        /**
         * @note: 使用浅层序列化(shallow serialization)即可，避免
         *   options参数含有非常大的子对象，带来性能消耗，甚至堆栈溢出
         */
        ft = $.param(opt, true);

        options || (me.featureString = ft);
        return ft;
    }

    // 展示loading
    ,showLoading: function(wrapper){
        var me = this;
        wrapper && $(wrapper).append(me.$pageLoading);
        me.$pageLoading.show();

        // 隐藏全局loading
        me.$globalLoading.hide();
    }

    // 隐藏loading
    ,hideLoading: function(time){
        var me = this;

        if(time < 0){
            me.$globalLoading.hide();
            me.$pageLoading.remove();
            return;
        }

        setTimeout(function(){
            me.$pageLoading.remove();
        }, time === undefined ? 300 : time);
    }

    // append到父节点
    ,append: function(view) {
        this._addSubview(view);
    }

    // append到指定DOM父节点
    // @note: 满足控制上是父子结点关系，DOM结构上却不是父子结点关系的场景
    // @param: {string or Zepto Object} container DOM父结点
    ,appendTo: function(view, container){
        this._addSubview(view, 'APPENDTO', container);
    }

    // prepend到父节点
    ,prepend: function(view) {
        this._addSubview(view, 'PREPEND');
    }

    // setup到父节点
    ,setup: function(view) {
        this._addSubview(view, 'SETUP');
    }

    /**
     * 添加子视图
     * @param {string} APPEND, PREPEND, SETUP, APPENDTO. default: APPEND
     */
    ,_addSubview: function(view, type, container) {
        var me = this;
        if(view instanceof rocket.baseview) {
            me.children[view.cid] = view;
            me.length++;
            view.parent = me;

            switch(type){
                case 'SETUP':
                    break;
                case 'PREPEND':
                    me.$el.prepend(view.$el);
                    break;
                case 'APPENDTO':
                    $(container).append(view.$el);
                    break;
                default:
                    me.$el.append(view.$el);
                    break;
            }
            // 默认不展示
            view.$el.hide();
        }
        else {
            throw new Error("rocket.view.append arguments must be an instance of rocket.view");
        }
    }

    ,remove: function(view){
        var me = this;

        if(view instanceof rocket.baseview) {
            delete me.children[view.cid];
            me.length--;
            view.parent = null;
            view.$el.remove();
        }
        // 移除自身
        else{
            me.parent && 
                me.parent.remove(me);
        }
    }

    ,firstChild: function(){
        var me = this;

        for(var i in me.children){
            return me.children[i];
        }
        return null;
    } 

    ,nextSibling: function(){
        var me = this,
            p = me.parent,
            prev = null,
            current = null;

        if(!p) return null;

        for(var i in p.children){

            prev = current;
            current = p.children[i];

            if(prev == me){
                return current;
            }
        }

        return null;
    }

    ,prevSibling: function(){
        var me = this,
            p = me.parent,
            prev = null,
            current = null;

        if(!p) return null;

        for(var i in p.children){

            prev = current;
            current = p.children[i];

            if(current == me){
                return prev;
            }
        }

        return null;
    }

    ,destroy: function() {
        var me = this;
        // 递归销毁子视图
        for(var key in me.children) {
            me.children[key].destroy();
        }

        // unbind 已注册事件
        me._unregisterEvents();
        me.unregisterEvents();
        me.undelegateEvents();

        // 从DOM中删除该本元素
        this.$el.remove();

        // 从内存中删除引用
        me.el = me.$el = null;

        // 从父级中删除本view
        if(me.parent) {
            delete me.parent.children[me.cid];
            // @todo: 从subpages里清除
        }
    }

    // 事件注册，子类重写之
    ,registerEvents: function(){}

    // 取消事件注册，子类重写之
    ,unregisterEvents: function(){}

    /**
     * 方向改变处理函数，子类重写之
     * @param {0|90|-90|180} from 变换前orientation
     * @param {0|90|-90|180} to 变换后orientation
     */
    ,onorientationchange: function(from, to){}

    // 通用事件注册
    ,_registerEvents: function(){
        var me = this, ec = me.ec;

        me._onorientationchange = function(e){
            me.pageOrientationToBe = window.orientation;
            /**
             * @note: 若是活动页，直接响应；非活动页，延迟响应，原因有：
             * 1. 避免多页面同时响应带来性能损耗
             * 2. 非活动页处于不可见状态，尺寸属性比如高度等不是期望值，可能导致错误
             */
            if(ec.isActivePage()){
                if(me.pageOrientation != me.pageOrientationToBe){
                    me.onorientationchange(
                        me.pageOrientation
                        ,me.pageOrientationToBe
                    ); 
                    me.pageOrientation = me.pageOrientationToBe;
                }
            }

        };

        $(window).on('orientationchange', me._onorientationchange);
        ec.on('pagebeforechange', me._onpagebeforechange, me);
        ec.on('pageafterchange', me._onpageafterchange, me);
    }

    // 取消通用事件注册
    ,_unregisterEvents: function(){
        var me = this, ec = me.ec;

        $(window).off('orientationchange', me._onorientationchange);
        /**
         * @note: 需要置空该函数，避免页面recycle以后仍然调用该函数，导致报错
         * 原因还不是很清楚，但有几个线索可以参考：
         * 1. 该函数没有直接通过off卸载掉
         * 2. 同样响应pagebeforechange事件的onpagebeforechange先于_onpagebeforechange执行，而前者调用了recycleSubpage
         * 目前证明可靠的方式是将onorientationchange函数置为空函数
         */
        me.onorientationchange
            = me.onsubpagebeforechange
            = me.onsubpageafterchange = function(){};

        ec.off('pagebeforechange', me._onpagebeforechange, me);
        ec.off('pageafterchange', me._onpageafterchange, me);
    }

    // pagebeforechange事件通用处理逻辑
    ,_onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param),
            spm = me.subpageManager;

        /**
         * @note: 注意，以下不是通用逻辑，还需view自身实现
        if(to == me.ec){
            me.$el.show();
        }
         */

        // 设备方向通用逻辑，非活动页延迟响应
        if(me.pageOrientation != me.pageOrientationToBe){
            me.onorientationchange(
                me.pageOrientation
                ,me.pageOrientationToBe
            ); 
            me.pageOrientation = me.pageOrientationToBe;
        }

        // 子页面相关通用逻辑
        if(spm && spm._subpages.length){

            // @note: 跨页面切换，当前子页面若不是目标子页面，须提前隐藏，保证切换效果
            if(to == me.ec && from != to){
                if(spm._currentSubpage
                    && spm._currentSubpage.featureString
                        != featureString){
                    spm._currentSubpage.$el.hide();
                }
            }

        }

    }

    // pageafterchange事件通用处理逻辑
    ,_onpageafterchange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param),
            fromSubpage, 
            toSubpage,
            spm = me.subpageManager;

        // @note: 子页面控制器通用逻辑
        if(to == me.ec && spm && spm._subpages.length){
            if(!spm.getSubpage(featureString)){
                // @todo: this._subpageClass validation
                var subView = new spm._subpageClass(
                        $.extend({}, param)
                        ,me
                    );
                me.append(subView);
                spm.registerSubpage(featureString, subView);
            }

            spm.setCurrentSubpage(spm.getSubpage(featureString));  
            fromSubpage = spm._previousSubpage;
            toSubpage = spm._currentSubpage;

            // 子页面间切换
            if(from == to){
                spm.switchSubpage(
                    fromSubpage 
                    ,toSubpage
                    ,params
                );
            }

            // 不同页面间切换
            /** 
             * @note: 作为目标页面才响应事件。跨页面切换时，非目标子页面会被
             *   提前（pagebeforechange）隐藏以保证效果，此时不宜再次进行switchSubpage
             *   调用，避免出现闪动
             */
            else if(to == me.ec){
                $.each(fromSubpage == toSubpage 
                    ? [fromSubpage] : [fromSubpage, toSubpage], 
                    function(key, item){
                        // item && console.log('subpagebeforechange directly');
                        item && item.onsubpagebeforechange
                             && item.onsubpagebeforechange(params);

                        // item && console.log('subpageafterchange directly');
                        item && item.onsubpageafterchange
                             && item.onsubpageafterchange(params);

                    }
                );

                // 子页面回收
                spm.recycleSubpage();
            }
        }

    }

    /**
     * 获取子页面管理器，单例
     */
    ,getSubpageManager: function(options){
        var me = this,
            spm;

        if(spm = me.subpageManager){
            return spm;
        }

        spm = me.subpageManager 
            = new rocket.subpagemanager(options, me);

        return spm;
    }

    /**
     * 计算子页面切换方向，子类可覆盖，提供自定义方向策略
     * @param {rocket.subview} 起始子页面
     * @param {rocket.subview} 目标子页面
     * @return {integer} 方向参数（含义可扩展）：0-无方向，1-向左，2-向右
     *

    ,getSubpageSwitchDir: function(fromSubpage, toSubpage){}

     */

    /**
     * 调整高度，使用算法避免频繁调整，特别针对iOS5以下版本使用iScroll的情况
     * @note: 比如页面内有很多图片资源的情况
     * @todo: 是否可用$.debounce，目前看不行，它会忽略非响应阶段的所有调用请求
     */
    ,refreshViewHeight: function(params){
        var me = this,
            now = (new Date()).getTime(),
            stack;

        if(!rocket.isLoaded){
            setTimeout(function(){
                me.refreshViewHeight();
            }, 200);
            return;
        }

        me.refreshRequestStack = me.refreshRequestStack || [];
        me.lastRefreshTime = me.lastRefreshTime || now; 
        stack = me.refreshRequestStack;

        if(now - me.lastRefreshTime < 1000 && me.isNotFirstRefresh){
            // 添加请求
            stack.push(1);
            return;
        }

        // 清空请求列表
        stack.length = 0;
        setTimeout(function(){
            me.refreshHeight && me.refreshHeight();
            me.lastRefreshTime = (new Date()).getTime();

            // 清理漏网之鱼
            setTimeout(function(){
                // 有刷新请求，但没有执行的，清理之
                if(stack.length > 0){
                    stack.length = 0;
                    me.refreshHeight && me.refreshHeight();
                }
            }, 1000);
        }, 0);

        me.isNotFirstRefresh = true;
    }

    ,tip: function(text, pos) {
        var $wrapper = $('#wrapper'),
            $tip = $wrapper.children(".global-tip");

        if($tip.length == 0){
            $tip = $('<div class="global-tip"><span></span></div>');
            $wrapper.append($tip);
        }

        $tip.find("span").text(text);

        $tip.css('top', $wrapper.height() / 2 + 'px');
        switch(pos){
            case 0:
                $tip.css('text-align', 'center');
                break;
            case 1:
                $tip.css('text-align', 'left');
                break;
            case 2:
                $tip.css('text-align', 'right');
                break;
        }
        $tip.show();

        setTimeout(function(){
            $tip.animate({"opacity":0}, 500, "", function(){
                $tip.hide();
                $tip.css({"-webkit-transition": "none", "opacity":1});
            });
        }, 1500);
    }

    /**
     * 显示：针对某些可直接展示，无必要通过pagebeforechange事件的元素，在创建阶段直接显示
     */
    ,show: function(){
        var me = this;
        setTimeout(function(){
            me.$el.show();
            // @todo: 可能不能保证subview真正视觉可见，因为其父节点可能是隐藏的
            me.onsubviewshow && me.onsubviewshow();
        }, 0);
    }

    ,hide: function(){
        this.$el.hide();
    }

    ,navigate: function(route){
        Backbone.history.navigate(route, {trigger:true});
    }

});

})(Zepto);



;
/**
 * Collection类
 */
(function($) {

rocket.collection = Backbone.Collection.extend({
    initialize: function(models, options){
        // 页面事件中心
        // this.ec = this.getRoot();
    }

    // 获取页面控制器
    // ,getRoot: function(){
    //     return rocket.view.prototype.getRoot.apply(this, arguments);
    // }

});

})(Zepto);


;

/**
 * Model类
 */
(function($) {

rocket.model = Backbone.Model.extend({
    initialize: function(attributes, options){

        // 页面事件中心
        // this.ec = this.getRoot();
    }

    // 获取页面控制器
    // ,getRoot: function(){
    //     return rocket.view.prototype.getRoot.apply(this, arguments);
    // }

});

})(Zepto);


;
/**
 * pageview类，页面视图控制器，充当页面事件中心
 */
(function($) {

rocket.pageview = rocket.baseview.extend({

    // 初始化函数
    initialize: function(options, action){
        var me = this;

        // 页面对应action
        if(!action){
            throw Error('pageview creation: must supply non-empty action parameter'); 
        }
        me.action = action;

        // 位置保留相关
        me._tops = {};
        me._currentLogicString = me._getLogicString(options);

        rocket.baseview.prototype.initialize.call(me, options, null);
    }

    ,isActivePage: function(){
        var me = this;
        return me.$el.css('display') == 'block';
    }

    ,_getLogicString: function(params){
        // @note: 出于性能考虑，只进行浅层序列化
        return $.param(params || {}, true) 
            || '__empty_logic_string__'; 
    }

    ,savePos: function(){
        var me = this;

        // @note: chrome pc (mac or win) 浏览器存在读取值不准确的情况
        me._tops[me._currentLogicString] = window.scrollY;
    }

    ,restorePos: function(params){
        var me = this,
            cls = me._currentLogicString 
                = me._getLogicString(params);

        // @note: iOS4需要延时
        setTimeout(function(){
            window.scrollTo(0, me._tops[cls] || 0);
        }, 0);
    }

});

})(Zepto);




;
/**
 * subpageview类，子页面视图控制器
 */
(function($) {

rocket.subpageview = rocket.baseview.extend({

    // 初始化函数
    initialize: function(options, parentView){
        if(parentView instanceof rocket.baseview){
            rocket.baseview.prototype.initialize.call(this, options, parentView);
        }
        else{
            throw Error('rocket.subpageview creation: must supply parentView, which is an instance of rocket.baseview');
        }
    }

    ,isActiveSubpage: function(){
        var me = this;
        return me.$el.css('display') == 'block';
    }

});

})(Zepto);




;
/**
 * Router类，监听URL变化，并作转发
 * 产品线需继承rocket.router类
 */
(function($) {

rocket.router = Backbone.Router.extend({

    // 实例化时自动调用
    initialize: function() {
        // 保存的视图列表，对应不同页面
        this.views = {};

        // 记录控制器变化
        this.currentView = null;
        this.previousView = null;
    },

    /**
     * 路由配置
     * 按照Backbone.Router指定方式配置，例子如下，该部分产品线定义
     */
    routes: {
        /*
        "": "index",
        "index/:type": "index",
        "page/:src/:title": "page",
        "search/:word": "search",
        */
    },

    /** 
     * 页面切换顺序配置
     * 产品线按以下格式配置，使用action名称
     */
    pageOrder: [/*'index', 'search', 'page'*/],

    /**
     * 默认页面切换动画，合理选择配置
     * @note: slide比较适用于固高切换
     * @note: fade比较适用DOM树较小的两个页面切换
     * @note: simple性能最好，但效果最一般
     * @note: dropdown只能用于固高切换
     */
    defaultPageTransition: 'simple',
    
    /**
     * 页面切换动画配置
     * @key {string} actionname-actionname，"-"号分隔的action名称串，不分先后，但支持精确设定
     * @value {string} animation name
     * @note: 以index和search为例，有两种可设定的值：index-search和search-index：
     *     1. 如果只设定了其中一个，则不分先后顺序同时生效。比如'index-search':'fade'，无论index->search还是search->index，切换动画总是fade
     *     2. 如果两个都设定了，则分别生效。比如'index-search':'fade'，'search-index':'slide'，那么index->search使用fade动画，search->index使用slide动画
     *     3. 如果两个都没有设定，则都是用默认动画
     */
    pageTransition: {
        // 'index-search': 'fade'
        // ,'index-page': 'slide'
    },

    /**
     * Hander，对应action index的处理方法。产品线定义
     * 以下为例子
     */

    /*
    index: function(type) {
        this.doAction('index', {
            type: decodeURIComponent(type)
        });
    },

    page: function(src, title) {
        this.doAction('page', {
            src: decodeURIComponent(src),
            title: decodeURIComponent(title)
        });
    },

    search: function(word) {
        this.doAction('search', {
            word: decodeURIComponent(word)
        });
    },
    */

    /**
     * action通用处理逻辑
     * @{param} action {string} action名称
     * @{param} params {object} action参数
     */
    doAction: function(action, params){
        var me = this, view = me.views[action];
        
        if(!view){
            view = me.views[action] 
                = new rocket.pageview[action](params, action); 
        } 
        
        // 切换视图控制器
        me.previousView = me.currentView;
        me.currentView = view;

        me.trigger('routechange', {
            from: me.previousView
            ,to: me.currentView
            // ,pageviews: $.extend({}, me.views)
        });

        me.switchPage(
            me.previousView, 
            me.currentView, 
            params
        );
    },

    /**
     * 通用切换页面逻辑
     * @{param} from {rocket.pageview}
     * @{param} to {rocket.pageview}
     * @{param} params {object}
     */
    switchPage: function(from, to, params){

        var me = this;

        var dir = 0, order = me.pageOrder, 
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            fromIndex, toIndex;

        /**
         * 计算页面切换方向：0-无方向，1-向左，2-向右
         */
        if(fromAction !== null && null !== toAction && fromAction !== toAction){
            if(-1 != ( fromIndex = order.indexOf( fromAction ) )
                && -1 != ( toIndex = order.indexOf( toAction ) ) ){
                dir = fromIndex > toIndex ? 2 : 1;
            }
        }

        // console.log([fromAction, toAction, dir].join(' | '));

        // 记忆位置
        me.enablePositionRestore && from && (from.savePos());

        $.each(from == to ? [from] : [from, to], function(key, item){
            item && item.trigger('pagebeforechange', {
                from: me.previousView, 
                to: me.currentView,
                params: params 
            });
        });
        
        me.doAnimation(
            from,
            to,
            dir,
            function(){
                /**
                 * 尽可能等切换稳定了再开始数据请求
                 * 延后一点用户感觉不出来，但能保证页面的稳定性
                 */

                // 恢复位置
                me.enablePositionRestore && to && (to.restorePos(params));

                $.each(from == to ? [from] : [from, to], function(key, item){
                    // item && console.log('router trigger pageafterchange');
                    item && item.trigger(
                        'pageafterchange', {
                            from: me.previousView, 
                            to: me.currentView,
                            params: params 
                        });
                });
            }
        );

    },

    /**
     * 选择相应切换动画并执行
     * @param fromView
     * @param toView
     * @param direction
     * @param callback
     */
    doAnimation: function(fromView, toView, direction, callback){

        var animate, me = this;

        // 根据action组合，选择不同切换动画方法
        animate = me._selectAnimation(
                fromView && fromView.action || null, 
                toView && toView.action || null
            ) || rocket['pageanimation_' + me.defaultPageTransition].animate; 

        animate(
            fromView && fromView.el, 
            toView && toView.el, 
            direction,
            callback
        );

    },

    /**
     * 根据action组合选择相应切换动画
     * @param fromAction
     * @param toAction
     * @return 切换动画方法 or undefined
     */
    _selectAnimation: function(fromAction, toAction){

        if(null == fromAction || null == toAction){
            return;
        }

        var me = this,
            animateName;

        // key不分顺序，需要试探两种顺序的配置
        animateName = me.pageTransition[fromAction + '-' + toAction]
            || me.pageTransition[toAction + '-' + fromAction];

        return rocket['pageanimation_' + animateName] 
            && rocket['pageanimation_' + animateName].animate;

    }

}); 

})(Zepto);



;
/**
 * subview类，页面子视图控制器
 */
(function($) {

rocket.subview = rocket.baseview.extend({

    // 初始化函数
    initialize: function(options, parentView){
        if(parentView instanceof rocket.baseview){
            rocket.baseview.prototype.initialize.call(this, options, parentView);
        }
        else{
            throw Error('rocket.subview creation: must supply parentView, which is an instance of rocket.baseview');
        }
    }

});

})(Zepto);




;
/**
 * globalview类，全局视图控制器
 * 用于管理独立于页面之外，不参与页面事件流的部分，层级上与全局路由同级，能读取全局路由信息
 */
(function($) {

rocket.globalview = rocket.baseview.extend({

    // 初始化函数
    initialize: function(options, router){
        var me = this;

        // 应用程序路由
        if(!router || !router instanceof rocket.router){
            throw Error('globalview creation: must supply an instance of rocket.router'); 
        }
        me.router = router;
        me.router.on('routechange', me._onroutechange, me);

        rocket.baseview.prototype.initialize.call(me, options, null);
    }

    // baseview会调用，先占位，后续可能有其他用处
    ,isActivePage: function(){
        return false;
    }

    /** 
     * 默认路由事件响应函数
     * @param from 起始页面控制器
     * @param to 目标页面控制器
     * @param pageviews 页面控制器列表，以action为索引
     */
    ,_onroutechange: function(params){
        var me = this,
            from = params.from,
            to = params.to,
            pageviews = params.pageviews;
    
        // console.log(pageviews);
        me.trigger('routechange', $.extend({}, params));
    }

    /**
     * 触发页面事件
     * @param action 页面action名称，多个action可由逗号分隔
     * @param eventName 事件名
     * @params params 事件参数
     */
    ,triggerPageEvent: function(action, eventName, params){
        var me = this,
            actions = action.split(/\s*,\s*/),
            pageView;

        // console.log(actions);

        $.each(actions, function(index, item){
            pageView = me.router.views[item];
            pageView && (pageView.trigger(eventName, params));
        });

    }

    // 获取当前活动action
    ,getCurrentAction: function(){
        return this.router && this.router.currentView.action || '';        
    }

});

})(Zepto);




;
(function($) {

// @todo: subpage positon retain
rocket.subpagemanager = function(options, subpageManagerView){
    var me = this,
        opt = options || {};

    me._subpageClass = opt.subpageClass || null;
    me.MAX_SUBPAGES = opt.maxSubpages || 3;
    me.subpageTransition = opt.subpageTransition || 'slide';
    me.subpageManagerView = subpageManagerView;

    me._subpages = [];
    me._currentSubpage = null;
    me._previousSubpage = null;

    me.defaultSubpageTransition = 'slide';
}; 

rocket.subpagemanager.prototype = {

    switchSubpage: function(from, to, params){
        var me = this,
            dir = 0;

        dir = me.subpageManagerView.getSubpageSwitchDir
            ? me.subpageManagerView.getSubpageSwitchDir(from, to)
                : me.getSubpageSwitchDir(from, to);

        // console.log([fromFeatureString, toFeatureString, dir].join(' | '));

        $.each(from == to ? [from] : [from, to], function(key, item){
            // item && console.log('subpagebeforechange');
            item && item.onsubpagebeforechange
                 && item.onsubpagebeforechange(params);
        });

        me.doSubpageAnimation(
            from,
            to,
            dir,
            function(){
                // 恢复位置
                // me.enablePositionRestore && to && (to.restorePos(params));
                $.each(from == to ? [from] : [from, to], function(key, item){
                    // item && console.log('subpageafterchange');
                    item && item.onsubpageafterchange
                         && item.onsubpageafterchange(params);
                });

                // 子页面回收
                me.recycleSubpage();
            }
        );

    }

    /**
     * 计算页面切换方向，子类可覆盖，提供自定义方向策略
     * @param {rocket.subview} 起始子页面
     * @param {rocket.subview} 目标子页面
     * @return {integer} 方向参数（含义可扩展）：0-无方向，1-向左，2-向右
     */
    ,getSubpageSwitchDir: function(fromSubpage, toSubpage){
        var me = this,
            dir = 0,
            subpages = me._subpages,
            fromFeatureString = fromSubpage 
                && fromSubpage.getFeatureString() || null,
            toFeatureString = toSubpage 
                && toSubpage.getFeatureString() || null,
            fromIndex = -1, toIndex = -1;
        
        for(var i=0; i<subpages.length; i++){
            if(subpages[i].name == fromFeatureString){
                fromIndex = i;
            }
            if(subpages[i].name == toFeatureString){
                toIndex = i;
            }
        }

        if(fromFeatureString !== null 
            && null !== toFeatureString && fromFeatureString !== toFeatureString){
            if(-1 != fromIndex && -1 != toIndex ){
                dir = fromIndex > toIndex ? 2 : 1;
            }
        }

        return dir;
    }

    /**
     * 选择相应切换动画并执行
     * @param fromView
     * @param toView
     * @param direction
     * @param callback
     */
    ,doSubpageAnimation: function(fromView, toView, direction, callback){

        var animate, me = this;

        // 根据action组合，选择不同切换动画方法
        animate = rocket['pageanimation_' + me.subpageTransition].animate; 

        animate(
            fromView && fromView.el, 
            toView && toView.el, 
            direction,
            callback
        );

    }

    /**
     * 注册子页面
     * @param name 子页面名称，用以唯一标记子页面
     * @param subpage 子页面，rocket.subview实例
     */
    ,registerSubpage: function(name, subpage){
        var me = this;
        if(!me.getSubpage(name)){
            me._subpages.push({
                name: name,
                subpage: subpage
            });
        }
    }

    /**
     * 获取子页面
     * @param name 子页面名称，用以唯一标记子页面
     * @return rocket.subview实例或者undefined
     */
    ,getSubpage: function(name){
        var me = this, 
            p = me._subpages;

        for(var i=0, len=p.length; i<len; i++){
            if(p[i].name == name){
                return p[i].subpage;
            }
        }
        return;
    }

    /**
     * 设置当前子页面 
     */
    ,setCurrentSubpage: function(subpage){
        var me = this;
        if(subpage instanceof rocket.baseview){
            if(subpage != me._currentSubpage){
                me._previousSubpage = me._currentSubpage;
                me._currentSubpage = subpage;
            }
        }
        else{
            throw Error('error in method setCurrentSubpage: '
                + 'subpage is not an instance of rocket.baseview');
        }
    }

    /**
     * 回收子页面
     * @todo: 回收算法求精
     */
    ,recycleSubpage: function(){
        var me = this, 
            p = me._subpages,
            item;

        while(p.length > me.MAX_SUBPAGES){
            item = p.shift();

            // 不回收当前活动子页面
            if(item.subpage == me._currentSubpage){
                me._subpages.push(item); 
            }
            else{
                item.subpage.destroy();
            }
        }

    }

};

})(Zepto);



;
(function($) {

    rocket.pageanimation_dropdown = {};

    function generateTransform(x, y, z) {
        return "translate" + (rocket.has3d ? "3d" : "") + "(" + x + "px, " + y + "px" + (rocket.has3d ? (", " + z + "px)") : ")");
    };

    /**
     * 垂帘动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:直接显示和隐藏， 1:开帘， 2:关帘
     * @param restore 是否恢复原位置
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_dropdown.animate = function(
        currentEle, nextEle, dir, 
        callback, restore) {

        // console.log('dropdown animate');

        if(dir === 0) {
            if(currentEle != nextEle) {
                // @note: 先隐藏当前，避免当前页面残留，确保切换效果
                currentEle && $(currentEle).hide();
                setTimeout(function(){
                    nextEle && $(nextEle).show();
                }, 0);
            }

            callback && callback();
            return;
        }

        // 由于多种动画混杂，必须进行位置恢复
        restore = true;

        // 1. 准备位置和状态
        nextEle = $(nextEle);
        currentEle = $(currentEle);
        
        var clientHeight = document.documentElement.clientHeight;
        var clientHeight = $(window).height();

        /**
         * 开帘： 显示下一，上拉当前，隐藏当前，恢复位置
         * 关帘： 显示下一，下拉下一，隐藏当前，恢复位置
         */

        // 1.1 显示下一元素
        // @note: 去除显示，不仅多余，还造成不流畅。后面动画已经指定其显示 
        // nextEle.show();

        // 1.2 设置z-index
        // 开帘：上拉当前元素需要确保当前元素比下一元素的z-index大
        if(1 == dir){
            currentEle.css('z-index', 1000); 
            nextEle.css('z-index', 999); 
        }
        // 关帘：下拉下一元素需要确保下一元素比当前元素的z-index大
        else{
            currentEle.css('z-index', 999); 
            nextEle.css('z-index', 1000); 
        }

        // 1.3 设置初始位置
        currentEle.css({
            "-webkit-transition-property": "-webkit-transform",
            "-webkit-transform": generateTransform(0, 0, 0), 
            "-webkit-transition-duration": "0ms",
            "-webkit-transition-timing-function": "ease-out",
            "-webkit-transition-delay": "initial",
        });

        nextEle.css({
            "-webkit-transition-property": "-webkit-transform",
            "-webkit-transform": generateTransform(0, dir === 1 ? "0" : "-" + clientHeight, 0), 
            "-webkit-transition-duration": "0ms",
            "-webkit-transition-timing-function": "ease-out",
            "-webkit-transition-delay": "initial",
            "display": "block",
        });

        setTimeout(function() {

            function endTransition() {
                endAllTransition();
                callback && callback();
            }

            // nextEle.one('webkitTransitionEnd', endTransition);
            // currentEle.one('webkitTransitionEnd', endTransition);

            function endAllTransition(){

                // console.log('endAllTransition');

                // 是否恢复原状，子页面切换使用
                if(restore){
                    currentEle.css({
                        "display": "none",
                        "-webkit-transform": generateTransform(0, 0, 0), 
                        "-webkit-transition-duration": "0ms"
                    });
                    nextEle.css({
                        "display": "block",
                        "-webkit-transform": generateTransform(0, 0, 0), 
                        "-webkit-transition-duration": "0ms",
                    });
                }
                else{
                    currentEle.css({
                        "display": "none",
                    });
                    nextEle.css({
                        "display": "block",
                    });
                }
            }

            // 2. 开始动画
            // 2.1 开帘，上拉当前元素
            if(1 == dir){
                currentEle.css({
                    "-webkit-transform": generateTransform(0, -clientHeight, 0), 
                    "-webkit-transition-duration": "450ms",
                });
            }
            // 2.2 关帘，下拉下一元素
            else{
                nextEle.css({
                    "-webkit-transform": generateTransform(0, 0, 0), 
                    "-webkit-transition-duration": "450ms",
                });
            }

            setTimeout(function(){
                setTimeout(function(){
                    endAllTransition();
                    callback && callback();
                }, 0);
            }, 500);
            
        }, 0);
        
    };

})(Zepto);

;
(function($) {

    rocket.pageanimation_fade = {};

    /**
     * 过门动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:无方向， 1:向左， 2:向右
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_fade.animate = function(currentEle, nextEle, dir, callback) {

        var $currentEle = currentEle && $(currentEle),
            $nextEle = nextEle && $(nextEle);

        if(!nextEle) return;

        if(!currentEle
            // @note: 切换的两个元素如果是同一个元素，须避免隐藏再展现的情况，防止跳跃感产生
            || currentEle == nextEle){
            $nextEle.show();
            callback && callback();
        }
        else{
            $currentEle.hide();
            // @note: 去掉延时，使动画不脱节
            // setTimeout(function(){
                $nextEle.show();
                // @note: 从非0值开始，避免全白页面让用户感觉闪眼
                $nextEle.css({opacity: 0.05});
                $nextEle.animate({opacity: 1}, 600, 'ease-in', callback);
            // }, 0);
        }

    };

})(Zepto);

;
(function($) {

    rocket.pageanimation_simple = {};

    /**
     * 过门动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:无方向， 1:向左， 2:向右
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_simple.animate = function(currentEle, nextEle, dir, callback) {

        var $currentEle = currentEle && $(currentEle),
            $nextEle = nextEle && $(nextEle);

        if(currentEle != nextEle){
            currentEle && $currentEle.hide();
            setTimeout(function(){
                nextEle && $nextEle.show();
            }, 0);
        }

        callback && callback();
    };

})(Zepto);


;
(function($) {

    rocket.pageanimation_slide = {};

    function generateTransform(x, y, z) {
        return "translate" + (rocket.has3d ? "3d" : "") + "(" + x + "px, " + y + "px" + (rocket.has3d ? (", " + z + "px)") : ")");
    };

    /**
     * 过门动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:无方向， 1:向左， 2:向右
     * @param restore 是否恢复原位置
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_slide.animate = function(
        currentEle, nextEle, dir, 
        callback, restore) {

        if(dir === 0) {
            if(currentEle != nextEle) {
                // @note: 先隐藏当前，避免当前页面残留，确保切换效果
                currentEle && $(currentEle).hide();
                setTimeout(function(){
                    nextEle && $(nextEle).show();
                }, 0);
            }

            callback && callback();
            return;
        }

        // 由于多种动画混杂，必须进行位置恢复
        restore = true;

        // 准备位置
        nextEle = $(nextEle);
        currentEle = $(currentEle);
        
        var clientWidth = document.documentElement.clientWidth;

        currentEle.css({
            "-webkit-transition-property": "-webkit-transform",
            "-webkit-transform": generateTransform(0, 0, 0), 
            "-webkit-transition-duration": "0ms",
            "-webkit-transition-timing-function": "ease-out",
            "-webkit-transition-delay": "initial",
        });
        nextEle.css({
            "-webkit-transition-property": "-webkit-transform",
            "-webkit-transform": generateTransform((dir === 1 ? "" : "-") + clientWidth, 0, 0), 
            "-webkit-transition-duration": "0ms",
            "-webkit-transition-timing-function": "ease-out",
            "-webkit-transition-delay": "initial",
            "display": "block",
        });

        setTimeout(function() {

            var ready = 0;

            function endTransition(e) {
                e.stopPropagation();
                // nextEle.off('webkitTransitionEnd', arguments.callee);
                ready++;

                if(2 == ready){
                    endAllTransition();
                    callback && callback();
                }
            }

            // @note: webkitTransitionEnd事件回调存在bug，慎用，目前使用setTimeout方式回调
            // nextEle.one('webkitTransitionEnd', endTransition);
            // currentEle.one('webkitTransitionEnd', endTransition);

            function endAllTransition(){

                // 是否恢复原状，子页面切换使用
                if(restore){
                    currentEle.css({
                        "display": "none",
                        "-webkit-transform": generateTransform(0, 0, 0), 
                        "-webkit-transition-duration": "0ms"
                    });
                    nextEle.css({
                        "display": "block",
                        "-webkit-transform": generateTransform(0, 0, 0), 
                        "-webkit-transition-duration": "0ms"
                    });
                }
                else{
                    currentEle.css({
                        "display": "none"
                    });
                    nextEle.css({
                        "display": "block"
                    });
                }
            }

            // 开始动画
            nextEle.css({
                "-webkit-transform": generateTransform(0, 0, 0), 
                "-webkit-transition-duration": "350ms"
            });

            currentEle.css({
                "-webkit-transform": generateTransform((dir === 1 ? "-" : "") + clientWidth, 0, 0), 
                "-webkit-transition-duration": "350ms"
            });

            setTimeout(function(){
                setTimeout(function(){
                    endAllTransition();
                    callback && callback();
                }, 0);
            }, 400);

        }, 0);
        
    };

})(Zepto);

;
