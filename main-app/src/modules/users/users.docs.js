/**
 * @openapi
 * tags:
 *   - name: Users
 *     description: Registration, login and password reset
 *
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 1 }
 *         name:      { type: string, example: Ada Obi }
 *         email:     { type: string, format: email, example: ada@example.com }
 *         createdAt: { type: string, format: date-time }
 *
 *     RegisterInput:
 *       type: object
 *       required: [name, email, password]
 *       properties:
 *         name:     { type: string, minLength: 2, maxLength: 100, example: Ada Obi }
 *         email:    { type: string, format: email, example: ada@example.com }
 *         password: { type: string, minLength: 8, maxLength: 72, example: StrongPass123 }
 *
 *     LoginInput:
 *       type: object
 *       required: [email, password]
 *       properties:
 *         email:    { type: string, format: email, example: ada@example.com }
 *         password: { type: string, example: StrongPass123 }
 *
 *     ForgotPasswordInput:
 *       type: object
 *       required: [email]
 *       properties:
 *         email: { type: string, format: email, example: ada@example.com }
 *
 *     ResetPasswordInput:
 *       type: object
 *       required: [token, password]
 *       properties:
 *         token:    { type: string, description: 64-character hex token from the reset email }
 *         password: { type: string, minLength: 8, maxLength: 72, example: NewStrongPass456 }
 */

/**
 * @openapi
 * /users/register:
 *   post:
 *     tags: [Users]
 *     summary: Register a new user
 *     description: Creates an account and queues a welcome email.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/RegisterInput' }
 *     responses:
 *       201:
 *         description: User created
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Registration successful }
 *                 data:    { $ref: '#/components/schemas/User' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       409:
 *         description: Email is already registered
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @openapi
 * /users/login:
 *   post:
 *     tags: [Users]
 *     summary: Log in
 *     description: "Returns a JWT. Send it as `Authorization: Bearer <token>` on protected routes."
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/LoginInput' }
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success: { type: boolean, example: true }
 *                 message: { type: string, example: Login successful }
 *                 data:
 *                   type: object
 *                   properties:
 *                     token: { type: string, example: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9... }
 *                     user:
 *                       type: object
 *                       properties:
 *                         id:    { type: integer, example: 1 }
 *                         name:  { type: string, example: Ada Obi }
 *                         email: { type: string, example: ada@example.com }
 *       400: { $ref: '#/components/responses/ValidationError' }
 *       401:
 *         description: Invalid email or password
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */

/**
 * @openapi
 * /users/forgot-password:
 *   post:
 *     tags: [Users]
 *     summary: Request a password reset email
 *     description: Always returns 200, whether or not the email exists, so it can't be used to discover accounts.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ForgotPasswordInput' }
 *     responses:
 *       200:
 *         description: Request accepted
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageResponse' }
 *       400: { $ref: '#/components/responses/ValidationError' }
 */

/**
 * @openapi
 * /users/reset-password:
 *   post:
 *     tags: [Users]
 *     summary: Reset password with the emailed token
 *     description: The token is single-use and expires after 15 minutes.
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema: { $ref: '#/components/schemas/ResetPasswordInput' }
 *     responses:
 *       200:
 *         description: Password reset
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/MessageResponse' }
 *       400:
 *         description: Validation failed, or the token is invalid or expired
 *         content:
 *           application/json:
 *             schema: { $ref: '#/components/schemas/ErrorResponse' }
 */