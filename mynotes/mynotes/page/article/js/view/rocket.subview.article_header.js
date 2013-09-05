(function($){

rocket.subview.article_header = rocket.subview.extend({

    el: '#article_page_header'

    ,infoTemplate: _.template($('#template_article_header').text())

    ,init: function(options){
        var me = this;
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        ec.on('pagebeforechange', me.onpagebeforechange, me);
        ec.on('articleinfochange', me.onarticleinfochange, me);
    }

    ,render: function(data){
        var me = this;

        me.$el.html(
            me.infoTemplate({
                info: data
            })
        );
    }

    ,onarticleinfochange: function(params){
        var me = this;
        if(params.info){
            me.render(params.info);
        }
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
