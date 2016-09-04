export default {
  RoleController: {
    create: ['validCredentials'],
    find: ['validCredentials']
  },
  UserController: {
    create: ['validCredentials'],
    find: ['validCredentials'],
    findOne: ['validCredentials', 'validObjectId'],
    remove: ['validCredentials', 'validObjectId']
  },
  CommandController: {
    create: ['validCredentials'],
    find: ['validCredentials'],
    findOne: ['validCredentials', 'validObjectId'],
    remove: ['validCredentials', 'validObjectId']
  },
  GroupController: {
    create: ['validCredentials'],
    find: ['validCredentials'],
    findOne: ['validCredentials', 'validObjectId'],
    remove: ['validCredentials', 'validObjectId']
  },
  ExecutionController: {
    create: ['validCredentials'],
    find: ['validCredentials'],
    findOne: ['validCredentials', 'validObjectId']
  }
};
