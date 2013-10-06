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
        var me = this;

        // 用于页面切换时，避免重复请求数据
        me.isFirstLoad = true;

        me.title = options.title;
        me.sliderIndex = options.sliderindex - 0;

        // 从跨页面model获取数据
        me.sectionCount = 0;
        me.section = null; 
        me.fetchSectionData();

        me.hideLoading(-1);
        me.render();
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

        ec.on('keydown', me.onkeydown, me);

        ec.on('goup', me.gooutlinepage, me);
        ec.on('goprev', me.ongoprev, me);
        ec.on('gonext', me.ongonext, me);
        ec.on('increaseimagesize', me.onincreaseimagesize, me);
        ec.on('decreaseimagesize', me.ondecreaseimagesize, me);
    }

    ,unregisterEvents: function(){
        var me = this, ec = me.ec;

        me.$el.off('swipeLeft swipeRight swipeDown keydown');
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
                // 重新获取数据并渲染，针对直接访问无数据，再次访问的情况
                if(!me.section){
                    me.fetchSectionData();
                    me.render();
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

    ,fetchSectionData: function(){
        var me = this,
            instance 
                = rocket.collection.outline_sections
                    .getInstance(me.title);
    
        me.section = instance 
            ? instance.getSection(me.sliderIndex)
                : null;

        me.sectionCount = instance
            ? instance.getSectionCount()
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
