(function($){

rocket.subview.index_header = rocket.subview.extend({

    el: '#index_page_header'

    ,init: function(options){
        var me = this;

        me.append(new rocket.subview.ui_searchbox(
            $.extend({}, options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
    }

    ,render: function(model){
        var me = this;
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

    ,onkeydown: function(e){
        var me = this,
            key = e.which; 

        switch(key){
            // "g" key down
            case 71:
                if(e.shiftKey){
                    me.goLast();
                }
                else{
                    me.goFirst();
                }
                break;

            // "0" key down
            case 79:
                me.goArticle();
                break;

            // "j" key down
            case 74:
                me.goDown();
                break;

            // "k" key down
            case 75:
                me.goUp();
                break;

        }
    }

});

})(Zepto);

