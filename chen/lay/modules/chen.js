layui.extend({
    conf: 'config'
}).define(['conf'], function(exports) {
    var conf = layui.conf;
    layui.extend(conf.extend);
    self.route = layui.router();
    //初始化整个页面
    self.initPage = function(initCallback){
        console.log('初始化整个页面!');
    }
    exports('chen', self);
});