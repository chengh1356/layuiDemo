layui.extend({
    chen: 'lay/modules/chen'
}).define(['chen', 'conf'], function(exports) {
    console.log('陈光辉成功!');
    layui.chen.initPage();
    exports('index',{});
});