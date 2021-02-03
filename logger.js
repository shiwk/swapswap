const {createLogger, format, transports} = require('winston');
const {combine, timestamp} = format;

const myCustomLevels = {
    levels: {
        info: 1,
        warn: 2,
        error: 0,
    },
    colors: {
        info: 'green',
        warn: 'yellow',
        error: 'red'
    }
};


Date.prototype.format = function(fmt) {
    var o = {
        "M+" : this.getMonth()+1,                 //月份
        "d+" : this.getDate(),                    //日
        "h+" : this.getHours(),                   //小时
        "m+" : this.getMinutes(),                 //分
        "s+" : this.getSeconds(),                 //秒
        "q+" : Math.floor((this.getMonth()+3)/3), //季度
        "S" : this.getMilliseconds()             //毫秒
    };
    if(/(y+)/.test(fmt)) {
        fmt=fmt.replace(RegExp.$1, (this.getFullYear()+"").substr(4 - RegExp.$1.length));
    }
    for(var k in o) {
        if(new RegExp("("+ k +")").test(fmt)){
            fmt = fmt.replace(RegExp.$1, (RegExp.$1.length==1) ? (o[k]) : (("00"+ o[k]).substr((""+ o[k]).length)));
        }
    }
    return fmt;
}

module.exports = {
    createLogger: (path) => createLogger({
        level: 'info',
        levels: myCustomLevels.levels,
        format: combine(timestamp(), format.json()),
        transports: [
            //
            // - Write all logs with level `error` and below to `error.log`
            // - Write all logs with level `info` and below to `combined.log`
            //
            new transports.File({filename: `${path}/error.log`, level: 'error'}),
            new transports.File({filename: `${path}/combined.${new Date().format("yyyy-MM-dd")}.log`}),
        ],
    })
};