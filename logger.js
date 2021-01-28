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

// if (process.env.NODE_ENV !== 'production') {
//     logger.add(new winston.transports.Console({
//         format: winston.format.simple(),
//     }));
// }

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
            new transports.File({filename: `${path}/combined.log`}),
        ],
    })
};