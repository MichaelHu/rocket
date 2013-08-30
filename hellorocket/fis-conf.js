fis.config.merge({
    roadmap : {
        path : [
            {
                reg : /^\/.+-aio.*\.css$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.+-aio.*\.js$/i,
                release : "/static$&"
            },
            {
                reg : /^\/.+\.(png|gif|jpg|jpeg)$/i,
                release : "/static$&"
            },
            {
                reg : /^\/hellorocket\/\w+\.html$/i,
                release : '/template$&'
            }
        ]
    }
});

fis.config.del('modules.optimizer.html');
