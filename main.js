// extends express request methods to ensure proper app namespacing

module.exports = function(config, sessions) {
    
    function Router(app) {
        if(!(this instanceof Router)) {
            return new Router(app);
        }
        
        this.name = app==config.mainApp ? '' : app;
        this.express = config.app;
    }
    
    Router.prototype.forceAuth = function(req,res,next) {
        sessions.emit('verify', req, res, next);
    };
    
    Router.prototype._verb = function() {
        var args = Array.prototype.slice.call(arguments),
            method = args.shift(),
            path = args.shift();
        
        if(path instanceof RegExp)
            path = new RegExp(path.toString().replace(/\/\^?/,'/'+this.name));
        else if(typeof path === "string")
            path = ('/'+this.name+'/'+path).replace(/\/+/g,'/');
        
        path = path.length > 1 ? path.replace(/\/$/,'') : path;
        
        args.unshift(path);

        this.express[method].apply(this.express,args);
        //console.log('= Route added for', path, method);
    };
    
    ['get','post','put','delete'].forEach(function(method) {
    
        Router.prototype[method] = function() {
            var args = Array.prototype.slice.call(arguments);
            args.unshift(method);
            this._verb.apply(this, args);
        };
        
    });
    
    Router.constructorArgs = ['appName'];
    
    return Router;
};