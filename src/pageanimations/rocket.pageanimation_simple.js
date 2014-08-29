// rocket.pageanimation_simple.js
(function($) {

    rocket.pageanimation_simple = {};

    /**
     * 过门动画
     * @param currentEle 当前需要移走的元素
     * @param nextEle 需要移入的元素
     * @param dir 动画方向，0:无方向， 1:向左， 2:向右
     * @param callback 动画完成后的回调函数
     */
    rocket.pageanimation_simple.animate = function(currentEle, nextEle, dir, callback) {

        if(currentEle != nextEle){
            /**
             * @note: 直接设置style比使用$.show效率更高，
             * 同时解决2G下模块化加载不能show成功的问题
             */
            currentEle && ( currentEle.style.display = 'none' );
            setTimeout(function(){
                nextEle && ( nextEle.style.display = 'block' );
            }, 0);
        }

        callback && callback();
    };

})(Zepto);


