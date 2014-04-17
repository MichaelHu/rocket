(function($){

rocket.pageview.about = rocket.pageview.extend({

    el: '#about_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.about_header(
            $.extend({}, options)
            ,me
        ));

        me.setup(new rocket.subview.about_content(
            $.extend({}, options)
            ,me
        ));

    }

});

})(Zepto);
