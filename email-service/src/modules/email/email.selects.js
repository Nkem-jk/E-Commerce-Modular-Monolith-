module.exports = {
  // returned to the worker
  logResponse: {
    id: true,
    jobId: true,
    type: true,
    to: true,
    status: true,
    providerId: true,
    sentAt: true,
  },

  // duplicate check: need the id to reuse the row, status to know if it was already sent
  dedupeCheck: { id: true, status: true },

  idOnly: { id: true },
};
