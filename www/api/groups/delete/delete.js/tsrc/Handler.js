'use strict';

describe('www.api.groups.delete.Delete', ()=>{

    const assert = require('assert');
    const re = (module)=>{ return require('../../../../../../src/' + module); }
    const createDbName=(name)=>{ return re('lib/db/tools').createDbName('www_api_groups_delete_delete_') + name };

    let api, masterDbProps, dbProps;
    let Router, Response, Delete;

    before(()=>{
        api = {};
        api.fs = require('fs');
        api.lib = {};
        api.lib.env = re('lib/env');
        api.lib.re = re('lib/re')(api);
        api.lib.db = {};
        api.lib.db.tools = re('lib/db/tools');
        api.lib.db.DbPool = re('lib/db/DbPool')(api);
        api.lib.Md5 = re('lib/Md5')(api);
        api.lib.routerHelper = re('lib/routerHelper')(api);
        api.model = {};
        api.model.types = re('model/types')(api);
        api.model.makeId = re('model/makeId')(api);
        api.model.User = re('model/User')(api);
        api.model.Users = re('model/Users')(api);
        api.model.Deployment = re('model/Deployment')(api);
        api.model.Deployments = re('model/Deployments')(api);
        api.model.Login = re('model/Login')(api);
        api.model.Logins = re('model/Logins')(api);
        api.model.Group = re('model/Group')(api);
        api.model.Groups = re('model/Groups')(api);
        api.model.helpers = {};
        api.model.helpers.add = re('model/helpers/add');
        api.model.helpers.delete = re('model/helpers/delete');
        api.model.helpers.count = re('model/helpers/count');
        api.model.helpers.query = re('model/helpers/query');
        api.model.factory = re('model/factory')(api);

        masterDbProps = api.lib.db.tools.masterDbProps;
        dbProps = JSON.parse(JSON.stringify(masterDbProps));

        Router = re('lib/testTools/express/Router')(api);
        Response = re('lib/testTools/express/Response')(api);
        Delete = re('lib/testTools/express/Delete')(api);
    });

    let model, router, method = {};
    describe('Setup', ()=>{

        const dbName = createDbName('1');
        it('Create db ' + dbName, (done)=>{
            dbProps.database = dbName;
            api.lib.db.tools.create(
                masterDbProps,
                dbProps.database,
                (err)=>{
                    assert(!err, err);
                    done();
                }
            );
        });

        it('Create model', (done)=>{
            api.model.factory.createModel(dbProps, (err, m)=>{
                assert(!err, err);
                assert(m);
                model = m;
                done();
            });
        });

        it('Create method', ()=>{
            const ROUTE = '/api/groups/delete';
            const METHOD = 'DELETE';
            router = new Router();
            method = api.lib.routerHelper.createHandler(router, 'www/api/groups/delete/delete.js');
            assert.equal(method.route, ROUTE);
            assert.equal(method.method, METHOD);

            Delete = Delete.bind(undefined, (req)=>{
                req.app = {
                    zzz: {
                        model:model
                    }
                };
            });
        });
    });

    describe('Main cases', (done)=>{
        it('Delete NOT existing group yes', (done)=>{
            const req = new Delete(
                {
                    gid: 'yes'
                }
            );

            const res = new Response();
            res.wait(()=>{
//              console.log('res:', res);
                assert.equal(200, res.result.code);
                assert(!res.result.value);
                done();
            });

            router.handle(method.route, req, res, router.next);        
        });

        it('Add 10 groups', (done)=>{
            const add = (index, count, cb)=>{
                if (index<count) {
                    model.groups.add(
                        {
                            gid: 'group-'+index
                        },
                        (err, group)=>{
                            assert(!err);
                            assert(group);
                            add(index+1, count, cb);
                        }
                    );
                } else {
                    cb();
                }
            };

            add(0, 10, done);
        });

        it('Check model', (done)=>{
            model.groups.list(undefined, 0, 100, (err, items)=>{
//              console.log('err:', err);
//              console.log('items:', items);
                assert(!err, err);
                assert(items);
                assert.equal(10, items.length);
                for (let i=0; i<10; ++i) {
                    assert.equal('group-'+i, items[i].gid);
                }
                done();
            });
        })

        it('Delete group-0', (done)=>{
            const req = new Delete(
                {
                    gid: 'group-0'
                }
            );

            const res = new Response();
            res.wait(()=>{
//              console.log('res:', res);
                assert.equal(200, res.result.code);
                assert(!res.result.value);
                done();
            });

            router.handle(method.route, req, res, router.next);        
        });

        it('Check model', (done)=>{
            model.groups.list(undefined, 0, 100, (err, items)=>{
//              console.log('err:', err);
//              console.log('items:', items);
                assert(!err, err);
                assert(items);
                assert.equal(10-1, items.length);
                for (let i=0; i<10-1; ++i) {
                    assert.equal('group-'+(i+1), items[i].gid);
                }
                done();
            });
        });

        it('Delete all groups', (done)=>{
            const deleteElement = (index, count, cb)=>{
                if (index<count) {
                    const req = new Delete(
                        {
                            gid: 'group-' + index
                        }
                    );

                    const res = new Response();
                    res.wait(()=>{
//                      console.log('res:', res);
                        assert.equal(200, res.result.code);
                        assert(!res.result.value);
                        deleteElement(index+1, count, cb);
                    });

                    router.handle(method.route, req, res, router.next);        
                } else {
                    cb();
                }
            }

            deleteElement(1, 10, done);
        });

        it('Check model', (done)=>{
            model.groups.list(undefined, 0, 100, (err, items)=>{
//              console.log('err:', err);
//              console.log('items:', items);
                assert(!err, err);
                assert(items);
                assert.equal(0, items.length);
                done();
            });
        });
    });
});

