(function($) {

    rocket.pageanimation_fade = {};

    /**
     * 过门动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:无方向， 1:向左， 2:向右
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_fade.animate = function(currentEle, nextEle, dir, callback) {

        var $currentEle = currentEle && $(currentEle),
            $nextEle = nextEle && $(nextEle);

        if(!nextEle) return;

        if(!currentEle
            // @note: 切换的两个元素如果是同一个元素，须避免隐藏再展现的情况，防止跳跃感产生
            || currentEle == nextEle){
            $nextEle.show();
            callback && callback();
        }
        else{
            $currentEle.hide();
            // @note: 去掉延时，使动画不脱节
            // setTimeout(function(){
                $nextEle.show();
                // @note: 从非0值开始，避免全白页面让用户感觉闪眼
                $nextEle.css({opacity: 0.05});
                $nextEle.animate({opacity: 1}, 600, 'ease-in', callback);
            // }, 0);
        }

    };

})(Zepto);

