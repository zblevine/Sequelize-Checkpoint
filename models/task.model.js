'use strict';

const db = require('./database');
const Sequelize = require('sequelize');

// Make sure you have `postgres` running!

//---------VVVV---------  your code below  ---------VVV----------

const Task = db.define('Task', {
  id: {
    primaryKey: true,
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
    validate: {
      notEmpty: true
    }
  },
  complete: {
    type: Sequelize.BOOLEAN,
    defaultValue: false
  },
  due: Sequelize.DATE
});

Task.clearCompleted = async function() {
  await this.destroy({
    where: {
      complete: true
    }
  });
}

Task.completeAll = async function() {
  await this.update(
    { complete: true },
    { where: { complete: false} }
  );
}

Task.belongsTo(Task, {as: 'parent'});

Task.prototype.getTimeRemaining = function() {
  return this.due ? this.due - new Date() : Infinity;
}

Task.prototype.isOverdue = function() {
  return !(this.complete || this.getTimeRemaining() > 0)
}

Task.prototype.addChild = function(params) {
  return Task.create({...params, parentId: this.id});
}

Task.prototype.getChildren = function() {
  return Task.findAll({
    where: {
      parentId: this.id
    }
  })
}

Task.prototype.getSiblings = function() {
  return Task.findAll({
    where: {
      parentId: this.parentId,
      id: {$ne: this.id}
    }
  })
}



//---------^^^---------  your code above  ---------^^^----------

module.exports = Task;

