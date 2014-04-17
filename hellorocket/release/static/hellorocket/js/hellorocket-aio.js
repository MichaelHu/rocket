(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        // 全局model
        // var modelvstuiguang = new rocket.model.vstuiguang();

        new rocket.router.hellorocket();
        Backbone.history.start();

        function scroll(e){
            $(document.body).height(600);

            // http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
            setTimeout(function(){
                window.scrollTo(0, 0);
                setTimeout(function(){
                    $(document.body).height($(window).height());
                }, 0);
                rocket.isLoaded = true;
            }, 1000); 

        }

        $(function(e){
            scroll();
        });

        /*
        setTimeout(function(){
            modelvstuiguang.fetch({
                callback: 'vstuiguangCalllback'
            }); 
        }, 300);
        */
    }

});

})(Zepto);    


(function($) {

rocket.router.hellorocket = rocket.router.extend({

    // 路由配置
    routes: {
        '': 'index'
        ,'index': 'index'
        ,'sayhello': 'sayhello'
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'index'
        ,'sayhello'
    ]

    // 位置记忆，默认为false，不进行位置记忆
    ,enablePositionRestore: true

    // 默认页面切换动画
    ,defaultPageTransition: 'simple'

    // 页面切换动画配置
    ,pageTransition: {
        /**
         * @note: slide比较适用于固高切换，fade比较适用DOM树较小的两个页面切换，simple性能最好，但效果最一般，合理选择配置
         */
        'index-sayhello': 'slide' 

    }

    ,index: function(title) {
        this.doAction('index', {});
    }

    ,sayhello: function(title) {
        this.doAction('sayhello', {});
    }

}); 

})(Zepto);





(function($){

rocket.pageview.index = rocket.pageview.extend({

    el: '#index_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.index_header(
            $.extend({}, options)
            ,me
        ));

        me.setup(new rocket.subview.index_content(
            $.extend({}, options)
            ,me
        ));

    }

});

})(Zepto);

(function($){

rocket.subview.index_content = rocket.subview.extend({

    el: '#index_page_content'

    ,events: {
        'click a': 'onclick'
    }

    ,init: function(options){
        var me = this;

        me.showLoading(me.$el);
        me.render();
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
        me.hideLoading(-1);
    }

    ,onclick: function(e){
        this.navigate('#sayhello'); 
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

});

})(Zepto);

(function($){

rocket.subview.index_header = rocket.subview.extend({

    el: '#index_page_header'

    ,init: function(options){
        var me = this;
        // todo
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

});

})(Zepto);

(function($){

rocket.pageview.sayhello = rocket.pageview.extend({

    el: '#sayhello_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.sayhello_header(
            $.extend({}, options)
            ,me
        ));

        me.setup(new rocket.subview.sayhello_content(
            $.extend({}, options)
            ,me
        ));

    }

});

})(Zepto);

(function($){

rocket.subview.sayhello_content = rocket.subview.extend({

    el: '#sayhello_page_content'

    ,init: function(options){
        var me = this;

        me.showLoading(me.$el);
        me.render();
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
        me.hideLoading(-1);
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

});

})(Zepto);

(function($){

rocket.subview.sayhello_header = rocket.subview.extend({

    el: '#sayhello_page_header'

    ,events: {
        'click .sayhello-page-header-backbtn': 'onbackbtn'
    }

    ,init: function(options){
        var me = this;

        // todo
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
        me.hideLoading(-1);
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

    ,onbackbtn: function(e){
        this.navigate('#');
    }
});

})(Zepto);

