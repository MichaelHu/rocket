(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        // 全局model
        // var modelvstuiguang = new rocket.model.vstuiguang();

        var router = new rocket.router.slider();

        // 初始化globalview
        new rocket.globalview.sidenav({}, router);
        new rocket.globalview.orientationrestrict({}, router);

        Backbone.history.start();

        function scroll(e){
            // 先设置成足够的高度，确保有足够高度能scrollTo(0, 0)
            // $('#wrapper').height(600);

            // http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
            setTimeout(function(){
                window.scrollTo(0, 0);
                setTimeout(function(){
                    $('#wrapper').height($(window).height());
                }, 0);
                rocket.isLoaded = true;
            }, 1000); 

        }

        $(function(e){
            scroll();
        });

        $(window).on('orientationchange resize', scroll);

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

rocket.router.slider = rocket.router.extend({

    // 路由配置
    routes: {
        '': 'outline'
        ,'outline/:title': 'outline'
        ,'slide/:title/:sliderindex': 'slide'
        // '*defaultUrl': 'defaultRoute'
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'outline'
        , 'slide'
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
        'outline-slide': 'dropdown' 

    }

    ,outline: function(title) {
        this.doAction('outline', {
                title: decodeURIComponent(title || '')
            }
        );
    }

    ,slide: function(title, sliderindex) {
        this.doAction('slide', {
                title: decodeURIComponent(title)
                ,sliderindex: decodeURIComponent(sliderindex)
            }
        );
    }

}); 

})(Zepto);





/**
 * helper对象：提供slider的一些常用帮助函数
 */
(function($) {

window.slider = window.slider || {};

slider.helper = {

    escapeHTML: function(str){
        // @note: escape & first
        return str.replace(/&/g, '&amp;')
            .replace(/</g, '&lt;')
            .replace(/>/g, '&gt;');
    }

    ,escapeMarkdownText: function(type, content){
        switch(type){
            case 'code':
                return slider.helper.escapeHTML(content)
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
                return slider.helper.escapeHTML(content)
                    .replace(/\+@@__LEFT__@@/g, '<')
                    .replace(/-@@__RIGHT__@@/g, '>')
                    .replace(/\+@@__EMPHASIS__@@/g, '<em>')
                    .replace(/-@@__EMPHASIS__@@/g, '</em>');
        }
    }

};
    
})(Zepto);


(function($){

rocket.collection.outline_sections = rocket.collection.extend({

    initialize: function(models, options){
        var me = this;

        me.title = options.title
            || 'ROCKET框架介绍';
        me.sections = null;

        me.isLoaded = false;

        // 保留实例引用
        rocket.collection.outline_sections._instances
            || (rocket.collection.outline_sections._instances = {});

        rocket.collection.outline_sections._instances[me.title] = me;
    }

    ,url: function(){

        return '/?tn=markdown&'
            + 'title=' +  encodeURIComponent(this.title);

        /*
        return '/articles/get_article.php?'
            + 'title=' +  encodeURIComponent(this.title);
        */
    }

    ,parse: function(resp, xhr){
        this.isLoaded = true;
        return resp.content.slice(1);
    }

    ,loaded: function(){
        return this.isLoaded;
    }

    ,getSections: function(){
        var me = this,
            models = me.models,
            model,
            sections = [],
            docinfoFlag = true;

        if(me.sections){
            return me.sections;
        }

        for(var i=0; i<models.length; i++){
            model = models[i];
            if('docinfo' == model.get('type')
                || 'headline' == model.get('type') 
                    && 2 == model.get('level')){
                sections.push([model.toJSON()]); 
            }
            else{
                sections[sections.length - 1].push(model.toJSON());
            }
        }
        me.sections = sections;

        return me.sections;
    }

    ,getSection: function(sliderindex){
        var me = this,
            sections = me.getSections(),
            sec = null;

        sec = sections[sliderindex - 1] || sec;

        return sec;
    }

    ,getSectionCount: function(){
        return this.getSections().length;
    }

});

// 通用model，提供跨页面访问
rocket.collection.outline_sections.getInstance = function(title){
    var instances = rocket.collection.outline_sections._instances;
    return instances && instances[title];
}; 

})(Zepto);


(function($){

rocket.pageview.outline = rocket.pageview.extend({

    el: '#outline_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.outline_content(
            $.extend({}, options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            keydownLocking = false;

        $(document).on('keydown', function(e){

            if(!keydownLocking
                && me.$el.css('display') == 'block'){
                keydownLocking = true;

                me.trigger('keydown', {
                    key: e.which 
                    ,target: me
                });

                setTimeout(function(){
                    keydownLocking = false;
                }, 500);
            }

        });

        me.$el.on('touchmove', function(e){
            e.preventDefault();
        });

    }

});

})(Zepto);

(function($){

rocket.subview.outline_content = rocket.subview.extend({

    el: '#outline_page_content'

    ,events: {
        'click .outline-page-content-relayoutbtn': 'relayout'
    }

    ,init: function(options){
        var me = this,
            instance; 

        me.title = options.title
            || 'ROCKET框架介绍';

        instance 
            = rocket.collection.outline_sections
                .getInstance(me.title);

        me.collection = instance
            || new rocket.collection.outline_sections(
                null
                ,$.extend({}, options)
            );

        // @note: 标识是否第一次加载，避免后续多次加载
        if(me.collection.loaded()){
            me.isFirstLoad = false; 
        }
        else{
            me.isFirstLoad = true; 
        }

        me.isRendered = false;

        me.maxZIndex = 1000;

        // 显示页面loading
        me.showLoading(me.$el);
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
        ec.on("pageafterchange", me.onpageafterchange, me);

        // collection的reset事件，model的change事件
        me.collection.on('reset', me.render, me);

        ec.on('keydown', me.onkeydown, me);

        me.$el.on('swipeUp', function(e){
            me.goslide();
        });

        me.$el.on('swipeDown', function(e){
            me.relayout('random');
        });

        ec.on('sidenav:relayout', me.relayout, me);
        ec.on('sidenav:down', me.goslide, me);
    }

    ,render: function(){
        var me = this,
            sections = me.collection.getSections();

        if(me.isRendered){
            return;
        }
        me.isRendered = true;

        for(var i=0; i<sections.length; i++){
            me.append(new rocket.subview.outline_content_tile(
                $.extend({}, me.options, {
                    sectionIndex: i+1
                })
                ,me
            ));
        }

        me.ec.trigger('dataready', sections);

        me.relayout('random');

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
                    reset: true
                    ,success: function(){
                        me.isFirstLoad = false;
                    }
                });
            }

            me.$el.show();
        }
    }

    ,onpageafterchange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            if(!me.isFirstLoad 
                && !me.isRendered){
                me.render();
            }
        }
    }

    ,onkeydown: function(params){
        var me = this,
            key = params.key;

        switch(key){
            // 'up arrow' key
            case 38:
                me.relayout('random');
                break;
            // 'down arrow' key
            case 40:
                me.goslide();
                break;
        }
    }

    ,goslide: function(){
        var me = this;
        me.navigate(
            '#slide'
            + '/' + encodeURIComponent(me.title)
            + '/1'  
            , {trigger: true}
        );
    }

    ,relayout: function(type){
        var me = this,
            type = type || 'random';

        me['relayout_' + type]();
    }

    ,getLayoutRanges: function(){
        var me = this,
            tiles = me.$('.outline-page-content-tile'),
            cw = me.$el.width(),
            ch = me.$el.height(),
            w = tiles.width(),
            h = tiles.height(),
            nx = Math.floor(cw/w),
            ny = Math.floor(ch/h),
            ranges = [], k;

        for(var i=0; i<ny; i++){
            for(var j=0; j<nx; j++){
                ranges.push({
                    ystart:i*(h+20)+30, 
                    yend:(i+1)*(h+20)+30, 
                    xstart:j*(w+20)+30, 
                    xend:(j+1)*(w+20)+30
                });
            }
        }

        return ranges;
    }

    ,relayout_grid: function(){
        var me = this,
            tiles = me.$('.outline-page-content-tile'),
            ranges = me.getLayoutRanges(),
            k;

        k = ranges.length;
        
        $.each(tiles, function(index, item){
            var range = ranges[index%k]; 
            $(item).css(
                me._gridStyle(range) 
            );  
        });
    }

    ,relayout_random: function(){
        var me = this,
            tiles = me.$('.outline-page-content-tile'),
            ranges = me.getLayoutRanges(),
            k;

        k = ranges.length;

        $.each(tiles, function(index, item){
            var range = ranges[index%k]; 
            $(item).css(
                me._randomStyle(range) 
            );  
        });
    }

    ,_gridStyle: function(range){
        var me = this;
        return {
            top: range.ystart + 'px'
            ,left: range.xstart + 'px'
            // ,'-webkit-transform': 'rotate(' + me._getRandomValue(-45, 45) + 'deg)'
        }; 
    }

    ,_randomStyle: function(range){
        var me = this;
        return {
            top: me._getRandomValue(range.ystart, range.yend) + 'px'
            ,left: me._getRandomValue(range.xstart, range.xend) + 'px'
            ,'-webkit-transform': 'rotate(' + me._getRandomValue(-45, 45) + 'deg)'
        }; 
    }

    ,_getRandomValue: function(min, max){
        var span, tmp;

        if(min > max){
            tmp = max;
            max = min;
            min = tmp;
        }
        span = max - min;

        return Math.floor(span * Math.random()) + min;
    }

});

})(Zepto);

(function($){

rocket.subview.outline_content_tile = rocket.subview.extend({

    className: 'outline-page-content-tile'

    ,template: _.template($('#template_outline_section').text())

    ,events: {
        'click .outline-page-content-tile-gobtn': 'ontilegobtnclick'

        // touch dragging
        ,'touchstart': 'ontiletouchstart'
        ,'touchmove': 'ontiletouchmove'
        ,'touchend': 'ontiletouchend'

        // mouse dragging
        ,'mousedown': 'ontilemousedown'
    }

    ,init: function(options){
        var me = this;

        me.title = options.title
            || 'ROCKET框架介绍';
        me.sectionIndex = options.sectionIndex;
        // @note: sectionData不通过options传递，避免featureString超大
        // console.log(me.featureString);
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
        ec.on('dataready', me.render, me);
    }

    ,render: function(sections){
        var me = this;

        me.$el.append(me.template({
            sectionIndex: me.sectionIndex
            ,sectionData: sections[me.sectionIndex - 1] 
        }));
        me.$el.data('index', me.sectionIndex);

        // @note: 密集DOM操作，展现操作可能需要延时才能保证被执行
        // setTimeout(function(){
            me.$el.show();
        // }, 0);
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

    ,ontilegobtnclick: function(e){
        var me = this,
            tile = $(e.target).closest('.outline-page-content-tile'),
            sliderIndex = tile.data('index');
       
        // tile.css('z-index', me.maxZIndex++); 
        Backbone.history.navigate(
            '#slide'
                + '/' + encodeURIComponent(me.title)
                + '/' + sliderIndex 
            ,{trigger:true}
        );
    }

    ,ontiletouchstart: function(e){
        var me = this,
            touch = e.targetTouches[0],
            tile = $(e.target).closest('.outline-page-content-tile');

        me.draggingTile = tile;

        me.tilePos = {
           pageX: touch.pageX 
           ,pageY: touch.pageY 
        };
    }

    ,ontiletouchmove: function(e){
        var me = this,
            touch = e.targetTouches[0],
            tile = $(e.target).closest('.outline-page-content-tile'),
            transform = tile.css('-webkit-transform');

        e.preventDefault();
        e.stopPropagation();

        transform = transform.replace(/translate\([^\)]+\)\s*/gi, '');

        tile.css(
            '-webkit-transform',
            'translate(' + (touch.pageX - me.tilePos.pageX) + 'px,'
                + (touch.pageY - me.tilePos.pageY) + 'px) '
                + transform
        );
    }

    ,ontiletouchend: function(e){
        var me = this,
            touch = e.changedTouches[0],
            tile = me.draggingTile,
            top = parseInt(tile.css('top')),
            left = parseInt(tile.css('left')),
            transform = tile.css('-webkit-transform');

        transform = transform.replace(/translate\([^\)]+\)\s*/gi, '');

        /*
         * @note: touch方式不需要恢复，和mouse的区别
         */
        tile.css({
            top: top + (touch.pageY - me.tilePos.pageY) + 'px' 
            ,left: left + (touch.pageX - me.tilePos.pageX) + 'px' 
            ,'-webkit-transform':transform
        });
    }


    ,ontilemousedown: function(e){
        var me = this,
            tile = $(e.target).closest('.outline-page-content-tile'),
            startX = e.pageX,
            startY = e.pageY;

        $(document).on('mousemove', function(e){
            var transform = tile.css('-webkit-transform');

            e.preventDefault();
            transform = transform.replace(/translate\([^\)]+\)\s*/g, '');
            tile.css(
                '-webkit-transform',
                'translate(' + (e.pageX - startX) + 'px,'
                    + (e.pageY - startY) + 'px) '
                    + transform
            );
        });

        $(document).on('mouseup', function(e){
            var top = parseInt(tile.css('top')),
                left = parseInt(tile.css('left')),
                transform = tile.css('-webkit-transform');

            transform = transform.replace(/translate\([^\)]+\)\s*/gi, '');
            tile.css({
                top: top + (e.pageY - startY) 
                ,left: left + (e.pageX - startX) 
                ,'-webkit-transform':transform
            });

            // 卸载事件监听
            $(document).off('mousemove mouseup');
        });

    }

});

})(Zepto);

(function($){

rocket.pageview.slide = rocket.pageview.extend({

    el: '#slide_page'

    ,init: function(options){
        var me = this;

        // setup content子视图
        me.setup(new rocket.subview.slide_content(
            $.extend({}, options), 
            me
        ));
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        me.$el.on('touchmove', function(e){
            e.preventDefault();
        });

        ec.on('keydown', me.onkeydown, me);

        ec.on('sidenav:increasefontsize', me.increaseFontSize, me);
        ec.on('sidenav:decreasefontsize', me.decreaseFontSize, me);
    }

    ,onkeydown: function(params){
        var me = this,
            key = params.key,
            shiftKey = params.shiftKey,
            ctrlKey = params.ctrlKey;
        
        // @note: 仅当活动子页面才响应
        if(me.ec.isActivePage()){
            switch(key){
                // '+' key
                case 187:
                    me.increaseFontSize();
                    break;
                // '-' key
                case 189:
                    me.decreaseFontSize();
                    break;
            }
        }
    }

    ,increaseFontSize: function(){
        var me = this,
            fs = parseInt(me.$el.css('font-size')) + 2;

        // console.log('increase font-size ' + fs);
        me.$el.css('font-size', fs + 'px');
        
    }

    ,decreaseFontSize: function(){
        var me = this,
            fs = parseInt(me.$el.css('font-size')) - 2;

        // console.log('decrease font-size ' + fs);
        me.$el.css('font-size', fs + 'px');
    }

});

})(Zepto);

(function($){

rocket.subpageview.slide_pageslider = rocket.subpageview.extend({

    // @todo: 强调view管理本身的el和className等，不跨级管理，做到分而治之
    className: 'slide-page-content-pageslider'

    ,events: {
        'click .markdown-slide-navigator-left': 'onnavigatingleft'
        ,'click .markdown-slide-navigator-right': 'onnavigatingright'
    }

    ,template: _.template($('#template_slide_news').text())

    ,init: function(options){
        var me = this,
            instance; 

        me.title = options.title;
        me.sliderIndex = options.sliderindex - 0;

        instance 
            = rocket.collection.outline_sections
                .getInstance(me.title);

        me.collection = instance
            || new rocket.collection.outline_sections(
                null
                ,$.extend({}, options)
            );

        // 从跨页面model获取数据
        me.sectionCount = 0;
        me.section = null; 

        // todo: 准确互斥
        if(me.collection.loaded()){
            me.fetchSectionData(me.collection);
            me.render();
        }

        me.hideLoading(-1);
    }

    ,render: function(){
        var me = this,
            section = me.section;

        if(me.section){
            me.$el.html(me.template({
                type: section[0].type == 'docinfo'
                    ? 'cover' : 'main' 
                ,section: me.section
            }));
        }
        else{
            // @note: 直接跳走
            setTimeout(function(){
                me.navigate([
                    '#outline/'
                    ,encodeURIComponent(me.title)
                ].join(''));
            }, 1000);
            /*
            if(!me.$('.slide-page-content-nocontenttip').length){
                me.$el.html($([
                    '<div class="slide-page-content-nocontenttip">'
                        ,'幻灯数据没有加载喔，先加载大纲看看:'
                        ,'<a href="#">'
                            ,me.title
                        ,'</a>'
                    ,'</div>'
                ].join('')));
            }
            */
        }

        me.el.setAttribute('data-feature', me.featureString);

        me.hideLoading();

        return me;
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        me.$el.on('swipeDown', function(e){
            me.gooutlinepage();
        });

        me.$el.on('swipeLeft', function(e){
            me.gonext();
        });

        me.$el.on('swipeRight', function(e){
            me.goprev();
        });

        me.collection.on('reset', me.ondataready, me);

        ec.on('keydown', me.onkeydown, me);

        ec.on('goup', me.gooutlinepage, me);
        ec.on('goprev', me.ongoprev, me);
        ec.on('gonext', me.ongonext, me);
        ec.on('increaseimagesize', me.onincreaseimagesize, me);
        ec.on('decreaseimagesize', me.ondecreaseimagesize, me);
    }

    ,unregisterEvents: function(){
        var me = this, ec = me.ec;

        me.$el.off('swipeLeft swipeRight swipeDown');

        me.collection.off('reset', me.ondataready, me);

        ec.off('goup', me.gooutlinepage, me);
        ec.off('goprev', me.ongoprev, me);
        ec.off('gonext', me.ongonext, me);
        ec.off('increaseimagesize', me.onincreaseimagesize, me);
        ec.off('decreaseimagesize', me.ondecreaseimagesize, me);
    }

    ,onsubpagebeforechange: function(params){
        var me = this, ec = me.ec, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param);

        if(to == me.ec){
            // 仅当参数与当前子页面参数吻合才响应
            if(me.featureString == featureString ){
                if(!me.collection.loaded()){
                    me.showLoading(me.$el);
                    me.collection.fetch({reset:true});
                } 
                me.$el.show();
            }
        }
    }

    ,onsubpageafterchange: function(params){
        var me = this, ec = me.ec, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param);

        if(to == me.ec){
            // 仅当参数与当前子页面参数吻合才响应
            if(me.featureString != featureString ){
                // me.$el.hide(); 
            }
        }
    }

    ,ondataready: function(collection){
        var me = this;
    
        me.fetchSectionData(collection);
        me.render();
    }

    ,fetchSectionData: function(collection){
        var me = this;
    
        me.section = collection 
            ? collection.getSection(me.sliderIndex)
                : null;

        me.sectionCount = collection
            ? collection.getSectionCount()
                : 0;
    }

    ,onnavigatingleft: function(e){
        this.goprev();
    }

    ,onnavigatingright: function(e){
        this.gonext();
    }

    ,onkeydown: function(params){
        var me = this,
            target = params.target,
            key = params.key,
            shiftKey = params.shiftKey,
            ctrlKey = params.ctrlKey;
        
        // @note: 仅当活动子页面才响应
        if(me == target 
            && me.ec.isActivePage()){
            switch(key){
                // 'left arrow' key
                case 37:
                    me.goprev();
                    break;
                // 'right arrow' key
                case 39:
                // 'space' key
                case 32:
                    me.gonext();
                    break;
                // 'up arrow' key
                case 38:
                    me.gooutlinepage();
                    break;
                // '[' key
                case 219:
                    me.decreaseImageSize();
                    break;
                // ']' key
                case 221:
                    me.increaseImageSize();
                    break;
            }
        }
    }

    ,ongoprev: function(params){
        var me = this,
            target = params.target;
        
        // @note: 仅当活动子页面才响应
        if(me == target 
            && me.ec.$el.css('display') == 'block'){
            me.goprev();
        }
    }

    ,ongonext: function(params){
        var me = this,
            target = params.target;
        
        // @note: 仅当活动子页面才响应
        if(me == target 
            && me.ec.$el.css('display') == 'block'){
            me.gonext();
        }
    }

    ,onincreaseimagesize: function(params){
        var me = this,
            target = params.target;
        
        if(me == target 
            && me.ec.$el.css('display') == 'block'){
            me.increaseImageSize();
        }
    }

    ,ondecreaseimagesize: function(params){
        var me = this,
            target = params.target;
        
        if(me == target 
            && me.ec.$el.css('display') == 'block'){
            me.decreaseImageSize();
        }
    }

    ,goprev: function(){
        var me = this,
            prev = me.sliderIndex - 1;

        prev = 
            prev < 1 ? 1 : prev; 

        Backbone.history.navigate(
            '#slide'
            + '/' + encodeURIComponent(me.title)
            + '/' + prev
            , {trigger: true}
        );

    }

    ,gonext: function(){
        var me = this,
            next = me.sliderIndex + 1;

        next = 
            next > me.sectionCount ?
                me.sliderIndex
                : next; 

        Backbone.history.navigate(
            '#slide'
            + '/' + encodeURIComponent(me.title)
            + '/' + next
            , {trigger: true}
        );
    }

    ,gooutlinepage: function(){
        var me = this;
        
        Backbone.history.navigate(
            '#outline'
            + '/' + encodeURIComponent(me.title)
            , {trigger: true}
        );
    }

    ,decreaseImageSize: function(){
        var me = this;

        $.each(me.$('img'), function(index, item){
            var width = parseInt($(item).css('width')) - 50;

            // console.log('decrease width to ' + width);        
            $(item).css('width', width + 'px');
        });
    }

    ,increaseImageSize: function(){
        var me = this;

        $.each(me.$('img'), function(index, item){
            var width = parseInt($(item).css('width')) + 50;

            // console.log('increase width to ' + width);        
            $(item).css('width', width + 'px');
        });
    }

});

})(Zepto);

(function($){

rocket.subview.slide_content = rocket.subview.extend({
    
    el: '#slide_page_content'

    ,init: function(options){
        var me = this,
            title = options.title,
            sliderIndex = options.sliderindex,
            subView,
            spm;

        spm = me.getSubpageManager({
            subpageClass: rocket.subpageview.slide_pageslider 
            ,maxSubpages: 2
            // ,subpageTransition: 'fade'
        });

        subView = new rocket.subpageview.slide_pageslider(
            $.extend({}, options),
            me
        );
        me.append(subView);

        // 注册子页面
        spm.registerSubpage(me.featureString, subView);
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
        ec.on("pageafterchange", me.onpageafterchange, me);

        var keydownLocking = false;
        $(document).on('keydown', function(e){
            if(!keydownLocking){
                keydownLocking = true;

                ec.trigger('keydown', {
                    key: e.which
                    ,shiftKey: e.shiftKey
                    ,ctrlKey: e.ctrlKey
                    ,target: me.subpageManager._currentSubpage
                });

                e.preventDefault();

                setTimeout(function(){
                    keydownLocking = false;
                }, 500);
            }
        });

        // global events from sidenav
        ec.on('sidenav:goup', function(){
            ec.trigger('goup', {
                target: me.subpageManager._currentSubpage    
            });        
        }, me);

        ec.on('sidenav:gonext', function(){
            ec.trigger('gonext', {
                target: me.subpageManager._currentSubpage    
            });        
        }, me);

        ec.on('sidenav:goprev', function(){
            ec.trigger('goprev', {
                target: me.subpageManager._currentSubpage    
            });        
        }, me);

        ec.on('sidenav:increaseimagesize', function(){
            ec.trigger('increaseimagesize', {
                target: me.subpageManager._currentSubpage    
            });        
        }, me);

        ec.on('sidenav:decreaseimagesize', function(){
            ec.trigger('decreaseimagesize', {
                target: me.subpageManager._currentSubpage    
            });        
        }, me);
    }

    ,unregisterEvents: function(){
        var me = this, ec = me.ec;

        ec.off("pagebeforechange", me.onpagebeforechange, me);
        ec.off("pageafterchange", me.onpageafterchange, me);
        $(document).off('keydown');
    }

    ,getSubpageSwitchDir: function(fromSubpage, toSubpage){
        var f = fromSubpage, 
            t = toSubpage,
            dir = 0;

        if(!f || !t){
            dir = 0;
        }
        else{
            dir = 
                parseInt(f.options.sliderindex) 
                    < parseInt(t.options.sliderindex)
                ? 1 : 2;
        }

        return dir;
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params,
            featureString = me.getFeatureString(param);

        if(to == me.ec){
            me.$el.show();
            me.refreshViewHeight();
        }
    }

    ,refreshHeight: function(){
        var me = this;
        window.scrollTo(0, 0);
        me.$el.height($(window).height());        
    }

    ,onorientationchange: function(from, to){
        var me = this; 
        // @note: 不直接调用refreshHeight，而调用refreshViewHeight，使用其延时
        me.refreshViewHeight();
    }

});

})(Zepto);

(function($){
 
rocket.globalview.orientationrestrict = rocket.globalview.extend({
     
    el: '#orientationrestrict_globalview'

    ,init: function(options){
        var me = this;

        if(Math.abs(window.orientation) == 90){
            me.$el.show();
        }
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        $(window).on('orientationchange', function(e){
            if(Math.abs(window.orientation) == 90){
                me.$el.show();    
            }
            else{
                me.$el.hide();    
            }
        });
    }

});

 })(Zepto);


(function($){
 
rocket.globalview.sidenav = rocket.globalview.extend({
     
    el: '#sidenav_globalview'

    ,init: function(options){
        var me = this;

        me.showNav = false;
        $.each(['common', 'outline', 'slide'], function(index, item){
            me.setup(new rocket.subview['sidenav_' + item + 'btns'](
                $.extend({}, options)
                ,me
            ));
        });

        me.heightConfig = {
            'outline': {
                'show': 164
                ,'hide': 40
            }
            ,'slide': {
                'show': 369
                ,'hide': 40
            }
        };
    }

    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on('routechange', me.onroutechange, me);
        ec.on('shownav', me.onshownav, me);
        ec.on('hidenav', me.onhidenav, me);
    }

    ,onroutechange: function(params){
        var me = this,
            from = params.from || null,
            to = params.to || null,
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            pageviews = params.pageviews;

        me.$el.show();
        me.refreshHeight(
            me.heightConfig[me.ec.getCurrentAction()][me.showNav?'show':'hide']        
        );
    }

    ,refreshHeight: function(height){
        var me = this;

        // @note: 避免一开始auto高度，自动撑开高度
        me.$el.height(me.$el.height());

        if(height != undefined){
            me.$el.animate({
                height: height + 'px'
            }, 300, 'ease-out');
        }
    }

    ,onshownav: function(){
        var me = this;
        me.showNav = true;
        me.refreshHeight(
            me.heightConfig[me.ec.getCurrentAction()][me.showNav?'show':'hide']        
        );
    }

    ,onhidenav: function(){
        var me = this;
        me.showNav = false;
        me.refreshHeight(
            me.heightConfig[me.ec.getCurrentAction()][me.showNav?'show':'hide']        
        );
    }

});

 })(Zepto);

(function($){

rocket.subview.sidenav_commonbtns = rocket.subview.extend({

    el: '#sidenav_globalview_commonbtngroup'

    ,events: {
        'click .sidenav-globalview-btn-info': 'oninfobtnclick'
        ,'click .sidenav-globalview-btn-leave': 'onleavebtnclick'
        ,'click .sidenav-globalview-btn-shutdown': 'onshutdownbtnclick'
    }

    ,init: function(options){
        var me = this;

        me.showNav = false;

        me.infoBtn = me.$('.sidenav-globalview-btn-info');
        me.leaveBtn = me.$('.sidenav-globalview-btn-leave');
        me.shutdownBtn = me.$('.sidenav-globalview-btn-shutdown');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        ec.on('routechange', me.onroutechange, me);
    }

    ,render: function(){
        var me = this;

        if(me.showNav){
            me.infoBtn.hide();            
            me.leaveBtn.show();            
            me.shutdownBtn.show();            
        }
        else{
            me.infoBtn.show();            
            me.leaveBtn.hide();            
            me.shutdownBtn.hide();            
        }

    }

    ,onroutechange: function(params){
        var me = this,
            from = params.from || null,
            to = params.to || null,
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            pageviews = params.pageviews;

        // common buttons总是显示
        me.$el.show();
        me.render();
    }

    ,onleavebtnclick: function(e){
        var me = this;

        if('' != document.referrer){
            document.location.href = document.referrer;
        }
    } 

    ,oninfobtnclick: function(e){
        var me = this;
        me.showNav = true;
        me.render();
        me.ec.trigger('shownav', {
            targetAction: me.ec.getCurrentAction()
        });
    } 

    ,onshutdownbtnclick: function(e){
        var me = this;
        me.showNav = false;
        me.render();
        me.ec.trigger('hidenav', {
            targetAction: me.ec.getCurrentAction()
        });
    } 

});

})(Zepto);

(function($){

rocket.subview.sidenav_outlinebtns = rocket.subview.extend({

    el: '#sidenav_globalview_outlinebtngroup'

    ,events: {
        'click .sidenav-globalview-btn-relayout': 'onrelayoutbtnclick'
        ,'click .sidenav-globalview-btn-down': 'ondownbtnclick'
    }

    ,init: function(options){
        var me = this;

        me.showNav = false;
        me.action = 'outline';
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        ec.on('routechange', me.onroutechange, me);
        ec.on('shownav', me.onshownav, me);
        ec.on('hidenav', me.onhidenav, me);
    }

    ,render: function(action){
        var me = this;

        if(me.showNav && me.action == action){
            me.$el.show();
        }
        else{
            me.$el.hide();
        }

    }

    ,onroutechange: function(params){
        var me = this,
            from = params.from || null,
            to = params.to || null,
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            pageviews = params.pageviews;

        if(me.action == toAction){
            me.render(toAction);
        }
        else{
            me.$el.hide();
        }
    }

    ,onrelayoutbtnclick: function(e){
        // @note: 全局事件名的格式标准：viewname:eventname
        this.ec.triggerPageEvent('outline', 'sidenav:relayout');
    } 

    ,ondownbtnclick: function(e){
        this.ec.triggerPageEvent('outline', 'sidenav:down');
    } 

    ,onshownav: function(params){
        var me = this,
            action = params.targetAction;

        me.showNav = true;
        if(action == me.action){
            me.render(action);
        }
    }

    ,onhidenav: function(params){
        var me = this,
            action = params.targetAction;;

        me.showNav = false;
        if(action == me.action){
            me.render(action);
        }
    }

});

})(Zepto);

(function($){

rocket.subview.sidenav_slidebtns = rocket.subview.extend({

    el: '#sidenav_globalview_slidebtngroup'

    ,events: {
        'click .sidenav-globalview-btn-up': 'onupbtnclick'
        ,'click .sidenav-globalview-btn-prev': 'onprevbtnclick'
        ,'click .sidenav-globalview-btn-next': 'onnextbtnclick'
        ,'click .sidenav-globalview-btn-increasefont': 'onincreasefontbtnclick'
        ,'click .sidenav-globalview-btn-decreasefont': 'ondecreasefontbtnclick'
        ,'click .sidenav-globalview-btn-increaseimage': 'onincreaseimagebtnclick'
        ,'click .sidenav-globalview-btn-decreaseimage': 'ondecreaseimagebtnclick'
    }

    ,init: function(options){
        var me = this;

        me.showNav = false;
        me.action = 'slide';
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        ec.on('routechange', me.onroutechange, me);
        ec.on('shownav', me.onshownav, me);
        ec.on('hidenav', me.onhidenav, me);
    }

    ,render: function(action){
        var me = this;

        if(me.showNav && action == me.action){
            // @note: 容器显示即可
            me.$el.show();
        }
        else{
            me.$el.hide();
        }

    }

    ,onroutechange: function(params){
        var me = this,
            from = params.from || null,
            to = params.to || null,
            fromAction = from && from.action || null,
            toAction = to && to.action || null,
            pageviews = params.pageviews;

        if(me.action == toAction){
            me.$el.show();
            me.render(toAction);
        }
        else{
            me.$el.hide();
        }

    }

    ,onprevbtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:goprev');
    } 

    ,onnextbtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:gonext');
    } 

    ,onupbtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:goup');
    } 

    ,onincreasefontbtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:increasefontsize');
    } 

    ,ondecreasefontbtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:decreasefontsize');
    } 

    ,onincreaseimagebtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:increaseimagesize');
    } 

    ,ondecreaseimagebtnclick: function(e){
        this.ec.triggerPageEvent('slide', 'sidenav:decreaseimagesize');
    } 

    ,onshownav: function(params){
        var me = this,
            action = params.targetAction;

        me.showNav = true;
        if(action == me.action){
            me.render(action);
        }
    }

    ,onhidenav: function(params){
        var me = this,
            action = params.targetAction;

        me.showNav = false;
        if(action == me.action){
            me.render(action);
        }
    }

});

})(Zepto);

