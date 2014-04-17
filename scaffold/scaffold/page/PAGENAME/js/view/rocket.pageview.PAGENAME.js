(function($){

rocket.pageview.PAGENAME = rocket.pageview.extend({

    el: '#PAGENAME_page'

    ,template: _.template($('#template_PAGENAME').text())

    ,init: function(options){
        var me = this;

        me.showLoading(me.$el);
        me.render();
    }

    ,render: function(){
        var me = this;

        me.$el.append(me.template({
            pageName: 'PAGENAME'        
        }));
        me.hideLoading(-1);
    }

});

})(Zepto);
