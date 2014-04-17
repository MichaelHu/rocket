(function($){

rocket.subview.about_content = rocket.subview.extend({

    el: '#about_page_content'

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
