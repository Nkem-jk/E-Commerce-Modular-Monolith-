const permissions = {
  super_admin: ["products:read", "products:write", "orders:read", "admins:invite"],
  admin: ["products:read", "products:write", "orders:read"],
  customer: ["products:read"],
};

module.exports = permissions;