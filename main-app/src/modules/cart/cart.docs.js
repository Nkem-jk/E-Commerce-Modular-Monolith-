/**
 * @openapi
 * tags:
 *   - name: Cart
 *     description: The logged-in user's cart
 *
 * components:
 *   schemas:
 *     CartItem:
 *       type: object
 *       properties:
 *         id:        { type: integer, example: 1 }
 *         productId: { type: integer, example: 3 }
 *         quantity:  { type: integer, example: 2 }
 *         product:
 *           type: object
 *           properties:
 *             id:       { type: integer, example: 3 }
 *             name:     { type: string, example: Mouse }
 *             price:    { type: integer, example: 5000 }
 *             imageUrl: { type: string, example: "https://example.com/notebook.jpg" }
 *             stock:    { type: integer, example: 10 }
 */

/**
 * @openapi
 * /cart:
 *   get:
 *     tags: [Cart]
 *     summary: Get my cart (login required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Cart items
 *   post:
 *     tags: [Cart]
 *     summary: Add a product to my cart (login required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [productId]
 *             properties:
 *               productId: { type: integer, example: 3 }
 *               quantity:  { type: integer, example: 1 }
 *     responses:
 *       201:
 *         description: Product added to cart
 *       400:
 *         description: Not enough stock
 *       401:
 *         description: Login required
 *       404:
 *         description: Product not found
 * /cart/{productId}:
 *   put:
 *     tags: [Cart]
 *     summary: Change the quantity of a cart item (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [quantity]
 *             properties:
 *               quantity: { type: integer, example: 4 }
 *     responses:
 *       200:
 *         description: Cart item updated
 *       400:
 *         description: Not enough stock
 *       401:
 *         description: Login required
 *       404:
 *         description: Item not in cart
 *   delete:
 *     tags: [Cart]
 *     summary: Remove a product from my cart (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: productId
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Item removed from cart
 *       401:
 *         description: Login required
 *       404:
 *         description: Item not in cart
 */