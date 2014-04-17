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
