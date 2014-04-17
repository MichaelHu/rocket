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
