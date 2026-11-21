const bcrypt = require("bcryptjs");
const usersRepository = require("./users.repository");
const selects = require("./users.selects");
const AppError = require("../../shared/utils/AppError");
const {
  hashToken,
  createResetToken,
  signAccessToken,
} = require("../../shared/utils/tokens");
const {
  sendWelcomeEmail,
  sendPasswordResetEmail,
} = require("../../shared/queue/emailQueue");

const SALT_ROUNDS = 12;

const DUMMY_HASH = bcrypt.hashSync("timing-safe-placeholder", SALT_ROUNDS);

async function register({ name, email, password }) {
  const existingAccount = await usersRepository.findOne({
    where: { email },
    select: selects.idOnly,
  });

  if (existingAccount) throw new AppError("Email is already registered", 409);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  const newUserAccount = await usersRepository.create({
    data: { name, email, password: hashedPassword },
    select: selects.publicUser,
  });

  await sendWelcomeEmail(newUserAccount);

  return newUserAccount;
}

async function login({ email, password }) {
  const user = await usersRepository.findOne({
    where: { email },
    select: selects.loginUser,
  });

  const isValidCredentials = await bcrypt.compare(
    password,
    user?.password ?? DUMMY_HASH,
  );

  if (!user || !isValidCredentials)
    throw new AppError("Invalid credentials", 401);

  const { password: _omit, ...safeUser } = user;

  return { token: signAccessToken(safeUser), user: safeUser };
}

async function forgotPassword({ email }) {
  const user = await usersRepository.findOne({
    where: { email },
    select: selects.resetRecipient,
  });

  if (!user) return;

  const { rawToken, hashedToken, expiresAt } = createResetToken();

  await usersRepository.update({
    where: { id: user.id },
    data: { resetToken: hashedToken, resetTokenExpiry: expiresAt },
    select: selects.idOnly,
  });

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${rawToken}`;

  await sendPasswordResetEmail(user, resetUrl);
}

async function resetPassword({ token, password }) {
  const user = await usersRepository.findOne({
    where: {
      resetToken: hashToken(token),
      resetTokenExpiry: { gt: new Date() },
    },
    select: selects.idOnly,
  });

  if (!user) throw new AppError("reset link is invalid or has expired", 400);

  const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

  await usersRepository.update({
    where: { id: user.id },
    data: {
      password: hashedPassword,
      resetToken: null,
      resetTokenExpiry: null,
    }, // single-use
    select: selects.idOnly,
  });
}

module.exports = { register, login, forgotPassword, resetPassword };
