layui.define(['jquery'],function(exports){
    var $ = layui.jquery;
    var self = {
        elem: null,
        barTime: 0,
        barWidth: 0,
        config:{
            color:'#f5a8bff',
            errorColor:'#FF5722',
            height: 2
        }
    };
    //取随机值
    function randomNum(minNum,maxNum){
        switch(arguments.length){
            case 1:
                return parseInt(Math.random() * minNum + 1,10);
            case 2:
                return parseInt(Math.random() * (maxNum - minNum + 1) + minNum,10);
            default:
                return 0;        
        }
    }
    //设置导航栏宽度
    function setBarWidth(num){
        self.barWidth = num;
        self.elem.css('width',self.barWidth + '%');
    }
    //添加导航栏宽度,最大为100
    function addBarWidth(num){
        self.barWidth += num;
        if(self.barWidth >= 100)self.barWidth = 100;
        setBarWidth(self.barWidth);
        return self.barWidth;
    }
    //隐藏导航栏
    function hideBar(barColor){
        clearInterval(self.barTimer);
        addBarWidth(100);
        self.elem.css({'backgroundColor':barColor});
        setTimeout(function(){
            //透明度设为0
            self.elem.css({
                'opacity':0
            });
            //宽度设为0
            setBarWidth(0);
        },250);
    }

    self.start = function(config){
        this.config = $.extend(this.config,config || {});
        if(this.barTime){
            clearInterval(this.barTime);
            setBarWidth(0);
        }
        if(this.elem == null){
            this.elem = $('<div id="chen-loadbar"></div>');
            $('body').prepend(this.elem);
        }
        this.elem.css({
            'height':this.config.height,
            'backgroundColor':this.config.color,
            'position':'fixed',
            'top':0,
            'left':0,
            'width':0,
            'opacity':1,
            'zIndex':2000,
            'transition':'all .2s linear'
        });
        addBarWidth(randomNum(1,10));
        this.barTime = setInterval(function(){
            addBarWidth(randomNum(1,10));
            if(self.barWidth >=75)self.barWidth = 75;
        },160);
    };
    self.finish = function(){
        hideBar(this.config.color);
    };
    self.error = function(){
        hideBar(this.config.errorColor);
    };
    exports('loadBar',self);
})