(function($){

rocket.subview.index_content = rocket.subview.extend({

    el: '#index_page_content'

    ,todosInfoTemplate: _.template($('#template_index_todosinfo').text())

    ,events: {
        // 'click a': 'onclick'
    }

    ,init: function(options){
        var me = this;

        me.collection = new rocket.collection.todolist(
            null
            ,{
                model: rocket.model.todo
            }
        );

        me.$todosInfo = me.$('.todos-info');
        me.showLoading(me.$el);
        me.render();
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, 
            ec = me.ec,
            todos = me.collection;

        ec.on("pagebeforechange", me.onpagebeforechange, me);

        todos.on('sync', me.render, me);
    }

    ,render: function(){
        var me = this,
            todos = me.collection,
            remaining = todos.remaining(),
            $todosInfo = me.$todosInfo;

        $todosInfo.html(me.todosInfoTemplate({
            itemsLeft: remaining.length
        }));
            
        me.hideLoading(-1);
    }

    ,onclick: function(e){
        this.navigate('#sayhello'); 
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            me.collection.fetch();
        }
    }

});

})(Zepto);
