/* eslint-disable no-unused-expressions */
/* eslint-env mocha, chai */
'use strict';

const helper = require('./helper');
const expect = require('chai').expect;
const Bluebird = require('bluebird');
const db = require('../models/database');
const Task = require('../models/task.model');

/**
 * Start here
 *
 * These tests describe the model that you'll be setting up in models/task.model.js
 *
 */

describe('Task', function () {

  // clear the database before all tests
  before(() => {
    return db.sync({force: true});
  });

  // erase all tasks after each spec
  afterEach(() => {
    return db.sync({force: true});
  });

  describe('Class methods', function () {

    beforeEach(() => {
      return Bluebird.all([
        Task.create({ name: 't1', due: helper.dates.tomorrow() }),
        Task.create({ name: 't2', due: helper.dates.tomorrow(), complete: true }),
        Task.create({ name: 't3', due: helper.dates.yesterday() }),
        Task.create({ name: 't4', due: helper.dates.yesterday(), complete: true })
      ]);
    });

    describe('clearCompleted', function () {
      xit('removes all completed tasks from the database', function () {
        return Task.clearCompleted()
          .then(() => {
            return Task.findAll({ where: { complete: true } });
          })
          .then((completedTasks) => {
            expect(completedTasks.length).to.equal(0);
            return Task.findAll({ where: { complete: false } });
          })
          .then((incompleteTasks) => {
            expect(incompleteTasks.length).to.equal(2);
          });
      });

    });

    describe('completeAll', function () {

      xit('marks all incomplete tasks as completed', function () {
        return Task.completeAll()
          .then(() => {
            return Task.findAll({ where: { complete: false } });
          })
          .then((incompleteTasks) => {
            expect(incompleteTasks.length).to.equal(0);
            return Task.findAll({ where: { complete: true } });
          })
          .then((completeTasks) => {
            expect(completeTasks.length).to.equal(4);
          });
      });

    });

  });

  describe('Instance methods', function () {

    describe('getTimeRemaining', function () {

      xit('returns the Infinity value if task has no due date', function () {
        const task = Task.build();
        expect(task.getTimeRemaining()).to.equal(Infinity);
      });

      xit('returns the difference between due date and now', function () {
        const oneDay = 24 * 60 * 60 * 1000; // one day in milliseconds

        // create a task due one day from this point in time
        const task = Task.build({
          due: helper.dates.tomorrow()
        });

        expect(task.getTimeRemaining()).to.be.closeTo(oneDay, 10); // within 10 ms
      });

    });

    describe('isOverdue', function () {

      xit('is overdue if the due date is in the past', function () {
        const task = Task.build({
          due: helper.dates.yesterday()
        });
        expect(task.isOverdue()).to.be.true;
      });

      xit('is not overdue if the due date is in the past but complete is true', function () {
        const task = Task.build({
          due: helper.dates.yesterday(),
          complete: true
        });
        expect(task.isOverdue()).to.be.false;
      });

      xit('is not overdue if the due date is in the future', function () {
        const task = Task.build({
          due: helper.dates.tomorrow()
        });
        expect(task.isOverdue()).to.be.false;
      });
    });

    let task;

    beforeEach(() => {
      return Task.create({
        name: 'task'
      })
      .then((_task) => {
        task = _task;
      });
    });

    describe('addChild', function () {

      xit('should return a promise for the new child', function () {
        return task.addChild({ name: 'task2' })
        .then((child) => {
          expect(child.name).to.equal('task2');
          expect(child.parentId).to.equal(task.id);
        });
      });

    });

    describe('getChildren', function () {

      beforeEach(() => {
        return task.addChild({ name: 'foo' });
      });

      xit('should return a promise for an array of the task\'s children', function () {
        return task.getChildren()
        .then(function(children) {
          expect(children).to.have.length(1);
          expect(children[0].name).to.equal('foo');
        });
      });

    });

    describe('getSiblings', function () {

      const childrenReferences = [];

      const childBuilder = function () {
        return task.addChild({ name: 'foo' })
        .then((child) => {
          childrenReferences.push(child);
        });
      };

      //build two children
      beforeEach(childBuilder);
      beforeEach(childBuilder);

      xit('returns a promise for an array of siblings', function () {
        return childrenReferences[0].getSiblings()
        .then((siblings) => {
          expect(siblings).to.have.length(1);
          expect(siblings[0].id).to.equal(childrenReferences[1].id);
        });
      });

    });

  });

});
