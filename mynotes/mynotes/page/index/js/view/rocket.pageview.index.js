(function($){

rocket.pageview.index = rocket.pageview.extend({

    el: '#index_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.index_lines(
            $.extend({}, me.options)
            ,me
        ));
    }

});

})(Zepto);
