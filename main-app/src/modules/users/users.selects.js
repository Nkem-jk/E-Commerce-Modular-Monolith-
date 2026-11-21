module.exports = {
  // returned to client after register
  publicUser: { id: true, name: true, email: true, createdAt: true },

  // existence check: just need to know a row is there
  idOnly: { id: true },

  // login: needs the hash to compare, stripped before responding
  loginUser: { id: true, name: true, email: true, password: true },

  // forget-password: needs name + email for the email job
  resetRecipient: { id: true, name: true, email: true },
};
