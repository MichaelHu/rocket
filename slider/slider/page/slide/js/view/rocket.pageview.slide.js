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
