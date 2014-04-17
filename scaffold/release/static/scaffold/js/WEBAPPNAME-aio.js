(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        // 全局model
        // var modelvstuiguang = new rocket.model.vstuiguang();

        new rocket.router.WEBAPPNAME();
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

rocket.router.WEBAPPNAME = rocket.router.extend({

    // 路由配置
    routes: {
        /**
         * 'PAGENAME/:param1/:param2': '_ROUTEHANDLER_'
         */

        '': 'PAGENAME'
        ,'PAGENAME': 'PAGENAME'

        /*
        '': 'index'
        ,'index': 'index'
        ,'sayhello': 'sayhello'
        */
    }

    // 页面切换顺序配置
    ,pageOrder: [
        /*
        'index'
        ,'sayhello'
        */
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
        // 'index-sayhello': 'slide' 

    }

    /**
     * route handlers
     */

    ,PAGENAME: function() {
        this.doAction('PAGENAME', {});
    }

    /*
    ,index: function() {
        this.doAction('index', {});
    }

    ,sayhello: function() {
        this.doAction('sayhello', {});
    }
    */

}); 

})(Zepto);





(function($){

rocket.pageview.PAGENAME = rocket.pageview.extend({

    el: '#PAGENAME_page'

    ,template: _.template($('#template_PAGENAME').text())

    ,init: function(options){
        var me = this;

        me.showLoading(me.$el);
        me.render();
    }

    ,render: function(){
        var me = this;

        me.$el.append(me.template({
            pageName: 'PAGENAME'        
        }));
        me.hideLoading(-1);
    }

});

})(Zepto);

