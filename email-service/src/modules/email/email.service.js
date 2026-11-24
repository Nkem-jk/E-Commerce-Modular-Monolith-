const emailRepository = require('./email.repository');
const selects = require('./email.selects');
const templates = require('../../templates');
const resend = require('../../shared/config/resend');
const AppError = require('../../shared/utils/AppError');

// Decide whether a failed send is worth retrying.
// Resend returns a real HTTP `statusCode` on API errors; a thrown network or
// timeout error has none. Client errors (4xx, except 429 rate-limiting) — bad
// address, validation failure, invalid payload, auth/config — won't succeed on
// retry, so they are permanent. Rate limits, Resend 5xx, and thrown
// network/timeout errors are transient and worth retrying.
function isRetryable(error) {
  const status = error?.statusCode;

  if (typeof status === 'number') {
    return status === 429 || status >= 500;
  }

  // No status code: a thrown network/timeout error — assume transient.
  return true;
}

async function sendEmail({ type, to, data, jobId }) {
  // idempotency: if this job already succeeded, do not send it
  let existing = null;

  if (jobId) {
    existing = await emailRepository.findOne({
      where: { jobId },
      select: selects.dedupeCheck,
    });

    if (existing?.status === 'sent') {
      const log = await emailRepository.findOne({
        where: { id: existing.id },
        select: selects.logResponse,
      });
      return { log, duplicate: true };
    }
  }

  // Build the email
  const { subject, html } = templates[type](data);

  // Reuse the failed/pending row on retry, otherwise create one 
  const logId = 
    existing?.id ??
    (
      await emailRepository.create({
        data: { jobId, type, to, subject },
        select: selects.idOnly
      })
    ).id;

  // Send via Resend
  let result = null;
  let error;

  try {
    ({ data: result, error } = await resend.emails.send(
      { from: process.env.EMAIL_FROM, to, subject, html },
      jobId ? { idempotencyKey: `${type}/${jobId}` } : undefined
    ));
  } catch (err) {
    error = err; // network failure, timeout,etc
  }

  // Record the outcome
  if (error) {
    await emailRepository.update({
      where: { id: logId },
      data: { status: 'failed', error: error.message, attempts: { increment: 1 }},
      select: selects.idOnly
    });

    // 502 = transient upstream failure, the worker should retry later.
    // 422 = permanent problem with this request (bad input/config), do not retry.
    const statusCode = isRetryable(error) ? 502 : 422;
    throw new AppError(`[resend] Resend failed: ${error.message}`, statusCode, {
      resendError: error.name ?? null,
      resendStatus: error.statusCode ?? null,
    });
  }

  const log = await emailRepository.update({
    where: { id: logId },
    data: {
      status: 'sent',
      providerId: result.id,
      sentAt: new Date(),
      error: null,
      attempts: { increment: 1 },
    },
    select: selects.logResponse
  });

  return { log, duplicate: false };
}

module.exports = { sendEmail };