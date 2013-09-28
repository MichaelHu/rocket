/**
 * helper对象：提供一些常用帮助函数
 */
(function($) {

window.howtorocket = window.howtorocket || {};

howtorocket.helper = {

    escapeHTML: function(str){
        // @note: escape & first
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    ,escapeMarkdownText: function(type, content){
        switch(type){
            case 'code':
                return howtorocket.helper.escapeHTML(content)
                    .replace(/[ \t]+/g, function($0){
                        var i = $0.length, 
                            str = '';
                        while(i-- > 0){
                            str += '&nbsp;';
                        }
                        return str;
                    });

            case 'paragraph':
            case 'ol':
            case 'ul':
                return howtorocket.helper.escapeHTML(content)
                    .replace(/\+@@__LEFT__@@/g, '<')
                    .replace(/-@@__RIGHT__@@/g, '>')
                    .replace(/\+@@__EMPHASIS__@@/g, '<em>')
                    .replace(/-@@__EMPHASIS__@@/g, '</em>');
        }
    }

};
    

})(Zepto);


(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        new rocket.router.howtorocket();
        Backbone.history.start();

        function scroll(e){
            $(document.body).height(600);

            // http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
            setTimeout(function(){
                window.scrollTo(0, 0);
                setTimeout(function(){
                    $(document.body).height($(window).height());
                });
                rocket.isLoaded = true;
            }, 1000); 

        }

        $(function(e){
            scroll();
        });

    }

});

})(Zepto);    


/**
 * vs产品的Router类
 */
(function($) {

rocket.router.howtorocket = rocket.router.extend({

    // 路由配置
    routes: {
        '': 'howtoindex'
        ,'howto/:title': 'howto'
        ,'howtoindex': 'howtoindex'
        // '*defaultUrl': 'defaultRoute'
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'howtoindex'
        , 'howto'
    ]

    // 位置记忆，默认为false，不进行位置记忆
    ,enablePositionRestore: true

    // 默认页面切换动画
    ,defaultPageTransition: 'slide'

    // 页面切换动画配置
    ,pageTransition: {
        /**
         * @note: slide比较适用于固高切换，fade比较适用DOM树较小的两个页面切换，simple性能最好，但效果最一般，合理选择配置
         */

        'howtoindex-howto': 'fade'
    }

    ,howtoindex: function(){
        this.doAction('howtoindex', {});
    }

    ,howto: function(title){
        this.doAction('howto', {
            title: decodeURIComponent(title)
        });
    }

    ,defaultRoute: function(defaultUrl) {
        Backbone.history.navigate('index', {trigger: true, replace: true});
    }

    /**
     * action处理逻辑
     * @{param} action {string} action名称
     * @{param} params {object} action参数
     * @{param} statOptions {object} 统计选项{disable:是否屏蔽统计,默认开启;param:{key: value,key: value}}]统计参数}
     */
    ,doAction: function(action, params, statOptions){
        // 必须延时，否则动画性能大打折扣
        // $.later(function(){
        //     var opts = statOptions ? statOptions : {}
        //     if(!opts.disable){
        //         var statObj = _.extend({
        //             'wa_type': action,
        //             'act' : 'switch'
        //         }, opts.params ? opts.params : {});
        //         rocket.v(statObj);
        //     }
        // });

        rocket.router.prototype.doAction.apply(this, arguments);
    }

}); 

})(Zepto);





(function($){

rocket.model.howto_article = rocket.model.extend({

    initialize: function(attributes, options){
        var me = this;
        me.title = options.title;
        // me.title = '什么情况下去跟进PC的HTML5技术';
        // me.title = 'UTF8 and UTF16 Conversions in VIM73';
        // me.title = 'Linux下Apache安装';
        // me.title = 'Linux下MySql的安装';
        // me.title = '切换到VBox4碰到的一些问题';
        // me.title = '用于简单日志分析的Linux命令';
        // me.title = '说说VIM的命令行开关：-c';
        // me.title = 'Linux下安装XPDF及其简单应用';
        // me.title = '如何创建一个webapp页面';
        // me.title = 'webapp framework涉及的一些概念'; 
    }

    ,url: function(){
        return '/?tn=markdown&act=get_article'
            + '&title=' +  encodeURIComponent(this.title);
    }

    ,parse: function(resp, xhr){
        return resp.content;
    }
});

})(Zepto);

(function($){

rocket.pageview.howto = rocket.pageview.extend({

    el: '#howto_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.howto_content(
            $.extend({}, options)
            ,me
        ));

        // @note: 只是需要简单设置title，无复杂逻辑，毋需单独创建一个toolbar的subview
        //     这个度开发同学自己拿捏，只要既满足要求又不影响易维护性即可
        me.$toolbarTitle = me.$('.vs-toolbar-titlecontainer');
        me.$toolbarTitle.html('ROCKET框架系列文档');
    }

});

})(Zepto);

(function($){

rocket.subview.howto_content = rocket.subview.extend({

    el: '#howto_page_content'

    ,init: function(options){
        var me = this,
            title = options.title,
            subView,
            spm;

        spm = me.getSubpageManager({
            subpageClass: rocket.subview.howto_content_article
            ,maxSubpages: 2
            ,subpageTransition: 'fade'
        });

        // 创建第一个子页面
        subView = new rocket.subview.howto_content_article(
            $.extend({}, options),
            me
        );
        me.append(subView);

        spm.registerSubpage(me.featureString, subView);
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
        }
    }
});

})(Zepto);

(function($){

/**
 * @note: 子页面平滑切换的要素，绝对定位，高度设置，子页面事件响应（显示不隐藏）
 */

rocket.subview.howto_content_article = rocket.subview.extend({

    // 动态创建使用的class
    className: 'howto-page-content-article'

    ,template: _.template($('#template_howto_article').text())

    ,init: function(options){
        var me = this;

        me.title = options.title;
        me.featureString = me.getFeatureString();
        me.isFirstLoad = true;
        me.model = new rocket.model.howto_article(
            $.extend({}, options)
            ,$.extend({}, options)
        );
        me.showLoading(me.$el);
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("subpagebeforechange", me.onsubpagebeforechange, me);

        me.model.on('change', me.render, me);
    }

    ,unregisterEvents: function(){
        var me = this, ec = me.ec;

        ec.off("subpagebeforechange", me.onsubpagebeforechange, me);

        me.model.off('change', me.render, me);
    }

    ,render: function(){
        var me = this;
        me.$el.append(me.template({
            article: me.model.toJSON()
        }));

        // 添加辅助信息，非必需
        me.$el.attr('data-title', me.title);
        me.hideLoading();
    }

    ,onsubpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param);

        if(to == me.ec) {
            if(me.featureString == featureString){
                if(me.isFirstLoad){
                    me.model.fetch({
                        success: function(){
                            me.isFirstLoad = false;
                        }
                    });
                }

                // 跨页面切换时，需要自行显示
                me.$el.show();
            }
        }
    }

});

})(Zepto);

(function($){

rocket.collection.howtoindex_articles = rocket.collection.extend({

    initialize: function(models, options){
        var me = this;
        me.tag = 'webapp框架';
    }

    ,url: function(){
        return '/?tn=markdown&act=list_articles'
            + '&tag=' +  encodeURIComponent(this.tag);
    }

    ,parse: function(resp, xhr){
        return resp;
    }

    // 按tag获取数据
    ,getByTag: function(tag){
        var me = this,
            articles;

        articles = $.map(me.models, function(item, index){
            if(new RegExp(tag, 'gi').test(item.get('tag'))){
                return item.toJSON();
            } 
        }); 

        return articles;
    }
});

})(Zepto);

(function($){

rocket.pageview.howtoindex = rocket.pageview.extend({

    el: '#howtoindex_page'

    ,init: function(options){
        var me = this;

        // me.setup(new rocket.subview.howtoindex_header(
        //     $.extend({}, options)
        //     ,me
        // ));

        me.setup(new rocket.subview.howtoindex_content(
            $.extend({}, options)
            ,me
        ));

        // @note: 只是需要简单设置title，无复杂逻辑，毋需单独创建一个toolbar的subview
        //     这个度开发同学自己拿捏，只要既满足要求又不影响易维护性即可
        me.$toolbarTitle = me.$('.vs-toolbar-titlecontainer');
        me.$toolbarTitle.html('ROCKET框架系列文档');

    }

});

})(Zepto);

(function($){

rocket.subview.howtoindex_content = rocket.subview.extend({

    el: '#howtoindex_page_content'

    ,template: _.template($('#template_howtoindex_articles').text())

    ,init: function(options){
        var me = this;

        // @note: 标识是否第一次加载，避免后续多次加载
        me.isFirstLoad = true;

        me.collection = new rocket.collection.howtoindex_articles(
            null
            ,$.extend({}, options)
        );

        // 显示页面loading
        me.showLoading(me.$el);
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);

        // collection的reset事件，model的change事件
        me.collection.on('reset', me.render, me);
    }

    ,render: function(){
        var me = this,
            jianjie_tag = '简介',
            basics_tag = '基础',
            rumen_tag = '入门',
            standards_tag = '规范',
            workshop_tag = 'workshop',
            jinjie_tag = '进阶';

        me.$el.append(me.template({
            jianjie_tag: jianjie_tag 
            ,jianjie_articles: me.collection.getByTag(jianjie_tag)

            ,basics_tag: basics_tag 
            ,basics_articles: me.collection.getByTag(basics_tag)

            ,workshop_tag: workshop_tag 
            ,workshop_articles: me.collection.getByTag(workshop_tag)

            ,rumen_tag: rumen_tag 
            ,rumen_articles: me.collection.getByTag(rumen_tag)

            ,standards_tag: standards_tag 
            ,standards_articles: me.collection.getByTag(standards_tag)

            ,jinjie_tag: jinjie_tag 
            ,jinjie_articles: me.collection.getByTag(jinjie_tag)
        }));

        me.hideLoading();
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            if(me.isFirstLoad){
                me.collection.fetch({
                    success: function(){
                        me.isFirstLoad = false;
                    }
                });
            }
            me.$el.show();
        }
    }

});

})(Zepto);

