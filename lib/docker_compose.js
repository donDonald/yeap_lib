'use strict';

const assert = require('assert');
const exec   = require('child_process').exec;

class Container {
    static create(line) {
//      console.log('Container.create(), line:' + line);
        let self;
        //const columns = line.split(/(\s+)/);
        //const columns = line.split(/(\s\s+)/);
        const columns = line.split(/(\s\s+)/).filter( function(e) { return e.trim().length > 0; } );
//      console.log('Container.create, columns:'); console.log(columns);
        if (columns.length > 0) {
            self = new Container(columns);
        }
//      console.log('Container.create, container:'); console.log(self);
        return self;
    }

    constructor(columns) {
        this.columns_ = columns;
    }

    get name() {
        return this.columns_[0];
    }

    get command() {
        return this.columns_[1];
    }

    get state() {
        return this.columns_[2];
    }

    get ports() {
        return this.columns_[3];
    }
}



const impl = {

    get tsrc() {
        this.tsrc_ = this.tsrc_ || {
            stdout: {
                lines: [],
  
                reset: function() {
                    this.lines = [];
                    return this;
                },

                push: function(string) {
                    this.lines.push(string || ' '); // some whitesapces are must
                    return this;
                },

                pop: function() {
                    return this.lines.pop();
                }
            }
        };
        return this.tsrc_;
    },



    set context(context) {
        this.context_ = context;
        return this;
    },



    get context() {
        assert(this.context_, 'Context is not set');
        return this.context_;
    }

};



impl.ps = function(cb) {
//  console.log('docker-compose.ps(), context:' + impl.context);
    assert(cb);
    const cmd = 'docker-compose ps';
    const opts =
    {
        cwd: impl.context
    };

    // mock stdout and exec here
    let stdout = impl.tsrc.stdout.pop();
    let exec2 = stdout ? (cmd, opts, cb)=>{ setImmediate(()=>{cb(undefined, stdout, undefined);}); } : exec;

    exec2(cmd, opts, function (err, stdout, stderr) {
//      console.log('docker-compose.ps, stdout:' + stdout);
//      console.log('docker-compose.ps, stderr:' + stderr);
        if (err) {
            cb(err);
        } else {
            const containers = impl.ps_handler(stdout);
//          console.log('docker-compose.ps, containers:'); console.log(containers);
            cb(undefined, containers);
        }
    });
}



impl.ps_handler = function(stdout) {
//  console.log('docker-compose.ps_handler(), stdout:' + stdout);
    const containers = {};
    const lines = stdout.split('\n');
    lines.forEach((line, index)=>{
//      console.log('docker.ps_handler, line[' + index + ']:' + line);
        if (index>1) {
            const container = Container.create(line);
            if (container) containers[container.name] = container;
        }
    });
//  console.log('docker-compose_ps.handler, containers:'); console.log(containers);
    return containers;
}



impl.build = function(cb) {
//  console.log('docker-compose.build(), context:' + impl.context);
    assert(cb);
    const cmd = 'docker-compose build';
    const opts =
    {
        cwd: impl.context
    };

    // mock stdout and exec here
    let stdout = impl.tsrc.stdout.pop();
    let exec2 = stdout ? (cmd, opts, cb)=>{ setImmediate(()=>{cb(undefined, stdout, undefined);}); } : exec;

    exec2(cmd, opts, function (err, stdout, stderr) {
//      console.log('docker-compose.build, stdout:' + stdout);
//      console.log('docker-compose.build, stderr:' + stderr);
        cb(err);
    });
};



impl.up = function(cb) {
//  console.log('docker-compose.up(), context:' + impl.context);
    assert(cb);
    const cmd = 'docker-compose up -d';
    const opts =
    {
        cwd: impl.context
    };

    // mock stdout and exec here
    let stdout = impl.tsrc.stdout.pop();
    let exec2 = stdout ? (cmd, opts, cb)=>{ setImmediate(()=>{cb(undefined, stdout, undefined);}); } : exec;

    exec2(cmd, opts, function (err, stdout, stderr) {
//      console.log('docker-compose.up, stdout:' + stdout);
//      console.log('docker-compose.up, stderr:' + stderr);
        if (err) {
            cb(err);
        } else {
            impl.ps((err, containers)=>{
//              console.log('docker-compose.up, containers:'); console.log(containers);
                cb(err, containers);
            });
        }
    });
};



impl.down = function(cb) {
//  console.log('docker-compose.down(), context:' + impl.context);
    assert(cb);
    const self = this;
    const cmd = 'docker-compose down';
    const opts =
    {
        cwd: impl.context
    };

    // mock stdout and exec here
    let stdout = impl.tsrc.stdout.pop();
    let exec2 = stdout ? (cmd, opts, cb)=>{ setImmediate(()=>{cb(undefined, stdout, undefined);}); } : exec;

    exec2(cmd, opts, function (err, stdout, stderr) {
//      console.log('docker-compose.down, stdout:' + stdout);
//      console.log('docker-compose.down, stderr:' + stderr);
        if (err) {
            cb(err);
        } else {
            impl.ps((err, containers)=>{
//              console.log('docker-compose.down, containers:'); console.log(containers);
                if (err) {
                    cb(err);
                } else if (Object.keys(containers).length !== 0) {
                    err = 'Some containers are still up and running for some reason, check containers list';
                    cb(err, containers);
                } else  {
                    cb();
                }
            });
        }
    });
};



impl.state = function(cb) {
    impl.ps((err, containers)=>{
        if (err) {
            cb(err);
        } else {
            let state = 'Down';
            const keys = Object.keys(containers);
            let count = keys.length;
            if (count > 0) {
                keys.forEach((k)=>{
                    const c = containers[k];
                //  console.log('container.name:' + c.name);
                //  console.log('container.state:' + c.state);
                    if (c.state == 'Up') {
                        --count;
                    }
                });
                state = count === 0 ? 'Up' : 'Unclear';
            }
            cb(undefined, state);
        }
    });
}



const dc = (context)=>{
    impl.context = context;    
    return impl;
}

module.exports = dc;

