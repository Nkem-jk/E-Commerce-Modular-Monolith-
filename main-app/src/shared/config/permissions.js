const permissions = {
  super_admin: ["products:write", "admins:invite"],
  admin: ["products:write"],
  customer: [],
};

module.exports = permissions;