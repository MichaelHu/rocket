(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        new rocket.router.howtorocket();
        Backbone.history.start();

        function scroll(e){
            $(document.body).height(600);

            // http://remysharp.com/2010/08/05/doing-it-right-skipping-the-iphone-url-bar/
            setTimeout(function(){
                window.scrollTo(0, 0);
                setTimeout(function(){
                    $(document.body).height($(window).height());
                });
                rocket.isLoaded = true;
            }, 1000); 

        }

        $(function(e){
            scroll();
        });

    }

});

})(Zepto);    

