(function($) {

$.extend(rocket, {
    init: function() {
        // loading object
        rocket.$globalLoading = $('#wrapper .global-loading');
        rocket.$pageLoading = $('#wrapper .page-loading');

        new rocket.router.mytoolkit();
        Backbone.history.start();
    }

});

})(Zepto);    



(function($) {

rocket.router.mytoolkit = rocket.router.extend({

    // 路由配置
    routes: {
        '': 'index'
        ,'todos': 'todos'
        ,'index': 'index'
        ,'about': 'about'
        ,'*default': 'index'
    }

    // 页面切换顺序配置
    ,pageOrder: [
        'index'
        ,'about'
        ,'todos'
    ]

    // 位置记忆，默认为false，不进行位置记忆
    ,enablePositionRestore: true

    // 默认页面切换动画
    ,defaultPageTransition: 'slide'

    // 页面切换动画配置
    ,pageTransition: {
        /**
         * @note: slide比较适用于固高切换，fade比较适用DOM树较小的两个页面切换，simple性能最好，但效果最一般，合理选择配置
         */
        // 'todos-about': 'slide' 

    }

    /**
     * route handlers
     */

    ,index: function() {
        this.doAction('index', {});
    }

    ,todos: function() {
        this.doAction('todos', {});
    }

    ,about: function() {
        this.doAction('about', {});
    }

}); 

})(Zepto);






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

(function($){

rocket.subview.about_content = rocket.subview.extend({

    el: '#about_page_content'

    ,init: function(options){
        var me = this;

        me.showLoading(me.$el);
        me.render();
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
        me.hideLoading(-1);
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

});

})(Zepto);

(function($){

rocket.subview.about_header = rocket.subview.extend({

    el: '#about_page_header'

    ,events: {
        'click .about-page-header-backbtn': 'onbackbtn'
    }

    ,init: function(options){
        var me = this;

        // todo
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
        me.hideLoading(-1);
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

    ,onbackbtn: function(e){
        this.navigate('#');
    }
});

})(Zepto);

(function($){

rocket.pageview.index = rocket.pageview.extend({

    el: '#index_page'

    ,init: function(options){
        var me = this;

        me.setup(new rocket.subview.index_header(
            $.extend({}, options)
            ,me
        ));

        me.setup(new rocket.subview.index_content(
            $.extend({}, options)
            ,me
        ));

    }

});

})(Zepto);

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

(function($){

rocket.subview.index_header = rocket.subview.extend({

    el: '#index_page_header'

    ,init: function(options){
        var me = this;
        // todo
    }

    // @note: 若不涉及回收，可以不提供unregisterEvents
    ,registerEvents: function(){
        var me = this, ec = me.ec;

        ec.on("pagebeforechange", me.onpagebeforechange, me);
    }

    ,render: function(sections){
        var me = this;
        // todo
    }

    ,onpagebeforechange: function(params){
        var me = this, 
            from = params.from,
            to = params.to,
            param = params.params;

        if(to == me.ec) {
            me.$el.show();
            // todo
        }
    }

});

})(Zepto);

(function($){

// The collection of todos is backed by *localStorage* instead of a remote
// server.
rocket.collection.todolist = rocket.collection.extend({

    // Reference to this collection's model.
    model: rocket.model.todo,

    // Save all of the todo items under the `"todos-backbone"` namespace.
    localStorage: new Backbone.LocalStorage("todos-backbone"),

    // Filter down the list of all todo items that are finished.
    done: function() {
        return this.where({done: true});
    },

    // Filter down the list to only todo items that are still not finished.
    remaining: function() {
        return this.without.apply(this, this.done());
    },

    // We keep the Todos in sequential order, despite being saved by unordered
    // GUID in the database. This generates the next order number for new items.
    nextOrder: function() {
        if (!this.length) return 1;
        return this.last().get('order') + 1;
    },

    // Todos are sorted by their original insertion order.
    comparator: 'order'

});


})(Zepto);





(function($){

rocket.model.todo = rocket.model.extend({

    // Default attributes for the todo item.
    defaults: function() {
        return {
            title: "empty todo...",
            // order: Todos.nextOrder(),
            order: this.collection.nextOrder(),
            done: false
        };
    },

    // Toggle the `done` state of this todo item.
    toggle: function() {
        this.save({done: !this.get("done")});
    }

});


})(Zepto);




(function($){

rocket.pageview.todos = rocket.pageview.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: '#todos_page'

    // Our template for the line of statistics at the bottom of the app.
    ,statsTemplate: _.template($('#stats-template').html())

    // Delegated events for creating new items, and clearing completed ones.
    ,events: {
        "keypress #new-todo":  "createOnEnter",
        "click #clear-completed": "clearCompleted",
        "click #toggle-all": "toggleAllComplete"
        ,'click .todos-page-header-backbtn': 'onbackbtnclick' 
    }

    ,init: function(options){
        var me = this, 
            todos;

        me.input = me.$("#new-todo");
        me.allCheckbox = me.$("#toggle-all")[0];

        me.footer = me.$('footer');
        me.main = $('#main');

        todos = me.collection 
            = new rocket.collection.todolist(
                null 
                ,{
                    model: rocket.model.todo
                }
            );

        me.isFirstLoad = true;

        me.hideLoading(-1);
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec,
            todos = me.collection;

        me.listenTo(todos, 'add', me.addOne);
        me.listenTo(todos, 'reset', me.addAll);
        me.listenTo(todos, 'all', me.render);

        ec.on('pagebeforechange', me.onpagebeforechange, me);
    }

    ,onpagebeforechange: function(params){
        var me = this,
            from = params.from,
            to = params.to,
            param = params.params,
            
            todos = me.collection;

        if(to == me.ec){
            // todos.fetch(); 
            if(me.isFirstLoad){
                todos.fetch({reset: true}); 
                me.isFirstLoad = false;
            }
        }
    }

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    ,render: function() {
        var me = this,
            todos = me.collection,
            done = todos.done().length,
            remaining = todos.remaining().length;

        if (todos.length) {
            me.main.show();
            me.footer.show();
            me.footer.html(
                me.statsTemplate({
                    done: done
                    ,remaining: remaining
                })
            );
        } else {
            me.main.hide();
            me.footer.hide();
        }

        me.allCheckbox.checked = !remaining;
    }

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    ,addOne: function(todo) {
        var me = this,
            view = new rocket.subview.todo({model: todo}, me);

        me.$("#todo-list").append(view.render().el);
    }

    // Add all items in the **Todos** collection at once.
    ,addAll: function() {
        var me = this;

        console.log(arguments);

        me.collection.each(me.addOne, me);
    }

    // If you hit return in the main input field, create new **Todo** model,
    // persisting it to *localStorage*.
    ,createOnEnter: function(e) {
        var me = this,
            todos = me.collection;

        if (e.keyCode != 13) return;
        if (!me.input.val()) return;

        todos.create({title: me.input.val()});
        me.input.val('');
    }

    // Clear all done todo items, destroying their models.
    ,clearCompleted: function() {
        _.invoke(this.collection.done(), 'destroy');
        return false;
    }

    ,toggleAllComplete: function () {
        var done = this.allCheckbox.checked;

        this.collection.each(function (todo) { 
            todo.save({'done': done}); 
        });
    }

    ,onbackbtnclick: function(e){
        this.navigate('#index');
    }

});

})(Zepto);


(function($){

rocket.subview.todo = rocket.subview.extend({

    //... is a list tag.
    tagName:  "li"

    // Cache the template function for a single item.
    ,template: _.template($('#item-template').html())

    // The DOM events specific to an item.
    ,events: {
        'click .toggle'   : 'toggleDone'
        ,'dblclick .view'  : 'edit'
        ,'click a.destroy' : 'clear'
        ,'keypress .edit'  : 'updateOnEnter'

        // "blur", "focus"事件在rocket下不能通过这种方式注册
        // ,'blur .edit'      : 'close'
    }

    ,init: function(options){
        var me = this;
    }

    ,registerEvents: function(){
        var me = this,
            ec = me.ec;
        
        me.listenTo(me.model, 'change', me.render);
        me.listenTo(me.model, 'destroy', me.remove);

    }

    ,render: function(data){
        var me = this;

        me.$el.html(me.template(me.model.toJSON()));
        me.$el.toggleClass('done', me.model.get('done'));
        me.input = me.$('.edit');

        me.input.on('blur', function(e){
            me.close(e);
        });

        return me;
    }

    // Toggle the `"done"` state of the model.
    ,toggleDone: function() {
        this.model.toggle();
    }

    // Switch this view into `"editing"` mode, displaying the input field.
    ,edit: function() {
        this.$el.addClass("editing");
        this.input.focus();
    }

    // Close the `"editing"` mode, saving changes to the todo.
    ,close: function() {
        var value = this.input.val();
        if (!value) {
            this.clear();
        } else {
            this.model.save({title: value});
            this.$el.removeClass("editing");
        }
    }

    // If you hit `enter`, we're through editing the item.
    ,updateOnEnter: function(e) {
        if (e.keyCode == 13) this.close();
    }

    // Remove the item, destroy the model.
    ,clear: function() {
        this.model.destroy();
    }

});

})(Zepto);


