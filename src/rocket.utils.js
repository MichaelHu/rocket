// rocket.utils.js
/**
 * rocket utils
 */
(function($) {

var utils = rocket.utils = rocket.utils || {};

var tipTimer, tipBusy;

$.extend(utils, {

    tip: function(text, xpos, ypos, duration/*ms*/){ 
        var $tip = $(".global-tip"),
            contHeight = $(window).height();

        duration = duration || 1500;
        
        if($tip.length == 0){
            $tip = $('<div class="global-tip"><span></span></div>');
            $('body').prepend($tip);
        }

        if(tipBusy){
            if(tipTimer){
                clearTimeout(tipTimer);
            }
        }

        tipBusy = true;

        $tip.find("span").text(text);

        switch(xpos){
            case 0:
                $tip.css('text-align', 'center');
                break;
            case 1:
                $tip.css('text-align', 'left');
                break;
            case 2:
                $tip.css('text-align', 'right');
                break;
        }

        switch(ypos){
            case 0:
                $tip.css('top', contHeight / 2 + 'px');
                break;
            case 1:
                $tip.css('top', '10px');
                break;
            case 2:
                $tip.css('bottom', '10px');
                break;
        }

        $tip.show();

        tipTimer = setTimeout(function(){
            $tip.animate({"opacity":0}, 300, "", function(){
                $tip.hide();
                $tip.css({"-webkit-transition": "none", "opacity":1});
                tipBusy = false;
            });
        }, duration);
     }



});

})(Zepto);



