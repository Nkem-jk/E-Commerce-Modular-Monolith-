const prisma = require("../config/db");

function requireSelect(select, method, modelName) {
  if (!select || Object.keys(select).length === 0) {
    throw new Error(
      `${modelName}.${method}: "select" is required, choose only the fields you need`,
    );
  }
}

/**
 * Generic repository. No bespoke methods: callers pass where/select/ data.
 * Every method takes an optional `tx` so it can run inside prisma.$transaction
 */
function createRepository(modelName) {
  const model = (tx) => (tx ?? prisma)[modelName];

  return {
    findOne({ where, select }, tx) {
      requireSelect(select, "findOne", modelName);
      return model(tx).findFirst({ where, select });
    },

    findMany({ where, select, orderBy, skip, take } = {}, tx) {
      requireSelect(select, "findMany", modelName);
      return model(tx).findMany({ where, select, orderBy, skip, take });
    },

    count({ where } = {}, tx) {
      return model(tx).count({ where });
    },

    create({ data, select }, tx) {
      requireSelect(select, "create", modelName);
      return model(tx).create({ data, select });
    },

    update({ where, data, select }, tx) {
      requireSelect(select, "update", modelName);
      return model(tx).update({ where, data, select });
    },

    updateMany({ where, data }, tx) {
      return model(tx).updateMany({ where, data }); // returns {count}
    },

    delete({ where, select }, tx) {
      requireSelect(select, "delete", modelName);
      return model(tx).delete({ where, select });
    },
  };
}

module.exports = createRepository;