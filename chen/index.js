layui.extend({
    chen: 'lay/modules/chen'
}).define(['chen', 'conf'], function(exports) {
    console.log('chen success!');
    layui.chen.initPage();
    exports('index',{});
});