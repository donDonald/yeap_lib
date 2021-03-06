'use strict';

describe("yeap_dev_tools.docker_compose, Simple docker-compose helper", ()=>{
    const assert = require('assert');
    const re = (module)=>{ return require('../' + module); }

    let docker_compose, dc;
    before(()=>{
        docker_compose = re('docker_compose.js');
    });

    describe("#docker-compose.ps_handler", ()=>{

        //      it('incorrect context(folder)', ()=>{
        //          const a = [
        //              'ERROR: ',
        //              '        Can\'t find a suitable configuration file in this directory or any',
        //              '        parent. Are you in the right directory?',
        //              '',
        //              '        Supported filenames: docker-compose.yml, docker-compose.yaml'
        //          ];
        //          const b = a.join('\n');

        //          const containers = dc.ps.handler(b);
        //          assert(containers);
        //          assert.equal(0, containers.length);
        //          assert.equal(0, Object.keys(containers).length);
        //      });
        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services', ()=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            const b = a.join('\n');

            const containers = dc.ps_handler(b);
            assert(containers);
            assert.equal(0, Object.keys(containers).length);
        });

        it('serviceA', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                ''
            ];
            const b = a.join('\n');

            const containers = dc.ps_handler(b);
            assert(containers);
            assert.equal(1, Object.keys(containers).length);

            assert(containers.serviceA);
            assert.equal('serviceA', containers.serviceA.name);
            assert.equal('Up', containers.serviceA.state);
            assert.equal('/entrypoint.sh', containers.serviceA.command);
            assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);
            done();
        });

        it('serviceA + serviceB', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            const b = a.join('\n');

            const containers = dc.ps_handler(b);
            assert(containers);
            assert.equal(2, Object.keys(containers).length);

            assert(containers.serviceA);
            assert.equal('serviceA', containers.serviceA.name);
            assert.equal('Up', containers.serviceA.state);
            assert.equal('/entrypoint.sh', containers.serviceA.command);
            assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);

            assert(containers.serviceB);
            assert.equal('serviceB', containers.serviceB.name);
            assert.equal('Up', containers.serviceB.state);
            assert.equal('docker-entrypoint.sh postgres', containers.serviceB.command);
            assert.equal('0.0.0.0:5432->5432/tcp', containers.serviceB.ports);
            done();
        });

        it('serviceA + serviceB + serviceC', ()=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                'serviceC        /bin/sh -c /auth-server/Do ...   Exit 126                              ',
                ''
            ];
            const b = a.join('\n');

            const containers = dc.ps_handler(b);
            assert(containers);
            assert.equal(3, Object.keys(containers).length);

            assert(containers.serviceA);
            assert.equal('serviceA', containers.serviceA.name);
            assert.equal('Up', containers.serviceA.state);
            assert.equal('/entrypoint.sh', containers.serviceA.command);
            assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);

            assert(containers.serviceB);
            assert.equal('serviceB', containers.serviceB.name);
            assert.equal('Up', containers.serviceB.state);
            assert.equal('docker-entrypoint.sh postgres', containers.serviceB.command);
            assert.equal('0.0.0.0:5432->5432/tcp', containers.serviceB.ports);

            assert(containers.serviceC);
            assert.equal('serviceC', containers.serviceC.name);
            assert.equal('Exit 126', containers.serviceC.state);
            assert.equal('/bin/sh -c /auth-server/Do ...', containers.serviceC.command);
            assert(!containers.serviceC.ports);
        });
    });




    describe("#docker-compose.ps", (done)=>{

        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services', (done)=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.ps((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(0, Object.keys(containers).length);
                done();
            });
        });

        it('serviceA', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.ps((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(1, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);
                done();
            });
        });

        it('serviceA + serviceB', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.ps((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(2, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);

                assert(containers.serviceB);
                assert.equal('serviceB', containers.serviceB.name);
                assert.equal('Up', containers.serviceB.state);
                assert.equal('docker-entrypoint.sh postgres', containers.serviceB.command);
                assert.equal('0.0.0.0:5432->5432/tcp', containers.serviceB.ports);
                done();
            });
        });
    });




    describe("#docker-compose.state", (done)=>{
        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services, Down', (done)=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Down', state);
                done();
            });
        });

        it('serviceA, Up', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Up', state);
                done();
            });
        });

        it('serviceA + serviceB, Up', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Up', state);
                done();
            });
        });

        it('serviceA + serviceB, Unclear', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Exit 0  0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n'));

            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Unclear', state);
                done();
            });
        });
    });




    describe("#docker-compose.build", ()=>{
        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services', (done)=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.build((err)=>{
                assert(!err, err);
                done();
            });
        });
    });




    describe("#docker-compose.up", ()=>{
        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services', (done)=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.up((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(0, Object.keys(containers).length);
                done();
            });
        });

        it('serviceA', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.up((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(1, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);
                done();
            });
        });

        it('serviceA + serviceB', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.up((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(2, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);

                assert(containers.serviceB);
                assert.equal('serviceB', containers.serviceB.name);
                assert.equal('Up', containers.serviceB.state);
                assert.equal('docker-entrypoint.sh postgres', containers.serviceB.command);
                assert.equal('0.0.0.0:5432->5432/tcp', containers.serviceB.ports);
                done();
            });
        });
    });




    describe("#docker-compose.down", ()=>{
        it('set context', ()=>{
            dc = docker_compose('some context is here');
        });

        it('no services', (done)=>{
            const a = [
                'Name                   Command              State    Ports',
                '--------------------------------------------------------------',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.down((err, containers)=>{
                assert(!err, err);
                assert(!containers);
                //assert.equal(0, Object.keys(containers).length);
                done();
            });
        });

        it('error, serviceA is still running', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.down((err, containers)=>{
                assert(err);
                assert(containers);
                assert.equal(1, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);
                done();
            });
        });

        it('error, serviceA and serviceB are still running for some reason', (done)=>{
            const a = [
                '    Name                   Command              State               Ports             ',
                '--------------------------------------------------------------------------------------',
                'serviceA        /entrypoint.sh                  Up      443/tcp, 0.0.0.0:11111->80/tcp',
                'serviceB        docker-entrypoint.sh postgres   Up      0.0.0.0:5432->5432/tcp  ',
                ''
            ];
            dc.tsrc.stdout.reset().push(a.join('\n')).push('this output doesn\'t matter');

            dc.down((err, containers)=>{
                assert(err);
                assert(containers);
                assert.equal(2, Object.keys(containers).length);

                assert(containers.serviceA);
                assert.equal('serviceA', containers.serviceA.name);
                assert.equal('Up', containers.serviceA.state);
                assert.equal('/entrypoint.sh', containers.serviceA.command);
                assert.equal('443/tcp, 0.0.0.0:11111->80/tcp', containers.serviceA.ports);

                assert(containers.serviceB);
                assert.equal('serviceB', containers.serviceB.name);
                assert.equal('Up', containers.serviceB.state);
                assert.equal('docker-entrypoint.sh postgres', containers.serviceB.command);
                assert.equal('0.0.0.0:5432->5432/tcp', containers.serviceB.ports);
                done();
            });
        });
    });




    describe("#docker-compose, testing real postgres + pgadmin compose file", ()=>{
        it('set context', ()=>{
            dc = docker_compose(`${__dirname}/pg_test`);
        });

        it('#ps, check no containers are up and running', (done)=>{
            dc.ps((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(0, Object.keys(containers).length);
                done();
            });
        });

        it('#down, check no containers', (done)=>{
            dc.down((err, containers)=>{
                assert(!err, err);
                assert(!containers);
                done();
            });
        });

        it('#state, check state', (done)=>{
            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Down', state);
                done();
            });
        });

        it('#up,  check all containers up and running', (done)=>{
            dc.up((err, containers)=>{
                assert(!err, err);
                assert(containers);
                assert.equal(2, Object.keys(containers).length);

                assert(containers.pg_test_pgadmin_1);
                assert.equal('Up', containers.pg_test_pgadmin_1.state);
                assert.equal('pg_test_pgadmin_1', containers.pg_test_pgadmin_1.name);
                assert.equal('/entrypoint.sh', containers.pg_test_pgadmin_1.command);
                assert.equal('443/tcp, 0.0.0.0:51111->80/tcp,:::51111->80/tcp', containers.pg_test_pgadmin_1.ports);

                assert(containers.pg_test_postgres_1);
                assert.equal('Up', containers.pg_test_postgres_1.state);
                assert.equal('pg_test_postgres_1', containers.pg_test_postgres_1.name);
                assert.equal('docker-entrypoint.sh postgres', containers.pg_test_postgres_1.command);
                assert.equal('0.0.0.0:55432->5432/tcp,:::55432->5432/tcp', containers.pg_test_postgres_1.ports);
                done();
            });
        });

        it('#state, check state', (done)=>{
            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Up', state);
                done();
            });
        });

        it('#down, check no containers', (done)=>{
            dc.down((err, containers)=>{
                assert(!err, err);
                assert(!containers);
                done();
            });
        });

        it('#state, check state', (done)=>{
            dc.state((err, state)=>{
                assert(!err, err);
                assert(state);
                assert.equal('Down', state);
                done();
            });
        });
    });

});

