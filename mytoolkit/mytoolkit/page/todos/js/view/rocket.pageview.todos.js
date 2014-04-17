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

