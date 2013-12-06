// rocket.baseview.js
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

    ,tip: function(text, xpos, ypos, duration/*ms*/) {
        rocket.utils.tip.apply(window, arguments);
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



