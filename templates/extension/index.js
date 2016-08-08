var config = require('cconfig')('../../config.json');
var log = require('llog');

function Task (taskname) {
  var self = this;
  this.concurrentJobs = config.concurrentJobs === undefined ? null : JSON.parse(config.concurrentJobs);
  this.params = config.params === undefined ? null : JSON.parse(config.params);
  this.taskname = taskname;
  process.on('message', function (msg) {
    var type = self[msg.type];
    if (type) {
      type(msg.param);
    }
  });
  process.on('SIGINT', function () {
    log.debug('received SIGINT from parent. terminating child %s', self.taskname || process.title);
    self.done();
    process.exit();
  });
  process.on('SIGTERM', function () {
    log.debug('received SIGTERM from parent. terminating child %s', self.taskname || process.title);
    self.done();
    process.exit();
  });
  process.on('uncaughtException', function (error) {
    log.error(error.message);
    if ( ! process.send) {
      console.log(error.message, error.stack);
      process.exit();
    }
    process.send({
      type: 'error',
      param: {
        message: error.message,
        stack: error.stack 
      }
    });
  });
}

Task.prototype.error = function (error) {
  if ( ! process.send) return;
  process.send({
    type: 'error',
    param: {
      message: error.message,
      stack: error.stack,
      param: error.param
    }
  });
};

Task.prototype.progress = function (param) {
  if ( ! process.send) return;
  process.send({
    type: 'progress',
    param: param
  });
};

Task.prototype.ready = function (param) {
  if ( ! process.send) return;
  process.send({
    type: 'ready'
  });
};

Task.prototype.timeout = function (param) {
  if ( ! process.send) return;
  process.send({
    type: 'timeout',
    param: param
  });
};

Task.prototype.done = function (param) {
  if ( ! process.send) return;
  process.send({
    type: 'done',
    param: param
  });
};

module.exports = Task;