(function($){

rocket.subview.search_header_pager = rocket.subview.extend({

    el: '#search_page_header_pager'

    ,init: function(options){
        var me = this;

        me.$current = me.$('input');
        me.$total = me.$('span');
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
        ec.on('pageinfochange', me.onpageinfochange, me);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            ec = me.ec,
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == ec){
            me.show();
        }
    }

    ,onpageinfochange: function(params){
        var me = this,
            total = params.total,
            current = params.current;

        // console.log(params);
        me.$current.val(current);
        me.$total.html('/ ' + total);
    }

});

})(Zepto);
