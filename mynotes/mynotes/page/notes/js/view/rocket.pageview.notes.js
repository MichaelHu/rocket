(function($){

rocket.pageview.notes = rocket.pageview.extend({

    el: '#notes_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.notes_header(
            $.extend({}, me.options)
            ,me
        ));

        me.setup(new rocket.subview.notes_lines(
            $.extend({}, me.options)
            ,me
        ));
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;

        $(document).on('keydown', function(e){
            // @note: only response in active page
            if(ec.isActivePage()
                // @note: omit form keydown
                && $(e.target).closest('form').length == 0){
                ec.trigger('keydown', {
                    event: e
                });
            }
        });
    }

});

})(Zepto);
