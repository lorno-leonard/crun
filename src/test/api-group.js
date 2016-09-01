/* globals app, Group */
/* eslint max-nested-callbacks: ["error", 6]*/
import {expect} from 'chai';
import _ from 'lodash';
import mongoose from 'mongoose';
import {isValidGroup} from '../lib/group';

let ObjectId = mongoose.Types.ObjectId;

let request;

describe('CRUN API', function() {
  this.timeout(20000);

  let admin = {
    username: process.env.ADMIN_USERNAME,
    password: process.env.ADMIN_PASSWORD
  };

  before(function * () {
    yield app.started;
    request = require('supertest')(app.server);
  });

  after(function * () {
    app.server.close();
  });

  describe('Groups', function() {
    describe('Validation', function() {
      it('should throw error when type is invalid', function() {
        let group = {
          type: 'group'
        };

        try {
          isValidGroup(group);
          expect(true).to.equal(false);
        } catch (err) {
          expect(err.message).to.equal('`group` is not a valid type');
        }
      });

      it('should not throw error for a valid group', function() {
        let group = {
          type: 'command',
          _id: new ObjectId().toHexString()
        };

        isValidGroup(group);
      });

      it('should throw error when _id is undefined', function() {
        let group = {
          type: 'command'
        };

        try {
          isValidGroup(group);
          expect(true).to.equal(false);
        } catch (err) {
          expect(err.message).to.equal('`_id` is undefined');
        }
      });

      it('should not throw error for a valid group', function() {
        let group = {
          type: 'serial',
          groups: [{
            type: 'command',
            _id: new ObjectId().toHexString()
          }, {
            type: 'command',
            _id: new ObjectId().toHexString()
          }]
        };

        isValidGroup(group);
      });

      it('should not throw error for a valid group', function() {
        let group = {
          type: 'serial',
          groups: [{
            type: 'parallel',
            groups: [{
              type: 'command',
              _id: new ObjectId().toHexString()
            }]
          }, {
            type: 'command',
            _id: new ObjectId().toHexString()
          }]
        };

        isValidGroup(group);
      });

      it('should throw error when _id is undefined', function() {
        let group = {
          type: 'serial',
          groups: [{
            type: 'parallel',
            groups: [{
              type: 'command'
            }]
          }, {
            type: 'command',
            _id: new ObjectId().toHexString()
          }]
        };

        try {
          isValidGroup(group);
          expect(true).to.equal(false);
        } catch (err) {
          expect(err.message).to.equal('`_id` is undefined');
        }
      });
    });

    describe('POST /groups', function() {
      let command;
      before(function * () {
        let result = yield request
          .post('/commands')
          .send({name: 'sleepy-head', command: 'sleep 2'})
          .auth(admin.username, admin.password)
          .expect(201);

        command = result.body;
      });
      it('should create new group', function * () {
        let group = {
          name: 'group',
          group: {
            type: 'command',
            _id: command._id
          }
        };

        let res = yield request
          .post('/groups')
          .send(group)
          .auth(admin.username, admin.password)
          .expect(201);

        expect(res.body).to.have.property('uri');
        expect(res.body).to.have.property('_id');

        group = yield Group.findById(res.body._id).exec();
        expect(group).to.has.property('name', 'group');
        expect(group).to.has.property('group');
        expect(group.group).to.be.deep.equal(group.group);
      });

      it('should create new group', function * () {
        let group = {
          name: 'complex group',
          group: {
            type: 'serial',
            groups: [{
              type: 'parallel',
              groups: [{
                type: 'command',
                _id: command._id
              }]
            }, {
              type: 'command',
              _id: command._id
            }]
          }
        };

        let res = yield request
          .post('/groups')
          .send(group)
          .auth(admin.username, admin.password)
          .expect(201);

        expect(res.body).to.have.property('uri');
        expect(res.body).to.have.property('_id');

        group = yield Group.findById(res.body._id).exec();
        expect(group).to.has.property('name', 'complex group');
        expect(group).to.has.property('group');
        expect(group.group).to.be.deep.equal(group.group);
      });

      it('should return INVALID_REQUEST', function * () {
        let group = {
          name: 'complex group',
          group: {
            type: 'serial',
            groups: [{
              type: 'parallel'
            }, {
              type: 'command',
              _id: command._id
            }]
          }
        };

        yield request
          .post('/groups')
          .send(group)
          .auth(admin.username, admin.password)
          .expect(function(res) {
            expect(res.body).to.has.property('code', 'INVALID_REQUEST');
          })
          .expect(400);
      });

      it('should return INVALID_REQUEST', function * () {
        let group = {
          name: 'complex group',
          group: {
            type: 'serial',
            groups: [{
              type: 'command',
              _id: new ObjectId().toHexString()
            }]
          }
        };

        yield request
          .post('/groups')
          .send(group)
          .auth(admin.username, admin.password)
          .expect(function(res) {
            expect(res.body).to.has.property('code', 'INVALID_REQUEST');
          })
          .expect(400);
      });
    });
  });
});
