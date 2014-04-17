(function($){

rocket.subview.search_header = rocket.subview.extend({

    el: '#search_page_header'

    ,init: function(options){
        var me = this;

        me.appendTo(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ), '#search_page_header_searchbox');

        me.append(new rocket.subview.search_header_pager(
            $.extend({}, options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
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

});

})(Zepto);
