/**
 * @openapi
 * tags:
 *   - name: Orders
 *     description: Checkout and order history (login required)
 */

/**
 * @openapi
 * /orders:
 *   post:
 *     tags: [Orders]
 *     summary: Turn my cart into an order (login required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       201:
 *         description: Order placed
 *       400:
 *         description: Cart is empty or not enough stock
 *       401:
 *         description: Login required
 *   get:
 *     tags: [Orders]
 *     summary: Get my orders (login required)
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: My orders
 *       401:
 *         description: Login required
 */

/**
 * @openapi
 * /orders/{id}:
 *   get:
 *     tags: [Orders]
 *     summary: Get one of my orders (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: The order
 *       401:
 *         description: Login required
 *       404:
 *         description: Order not found
 */

/**
 * @openapi
 * /orders/{id}/cancel:
 *   put:
 *     tags: [Orders]
 *     summary: Cancel a pending order and return its stock (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema: { type: integer }
 *     responses:
 *       200:
 *         description: Order cancelled
 *       400:
 *         description: Only pending orders can be cancelled
 *       401:
 *         description: Login required
 *       404:
 *         description: Order not found
 */