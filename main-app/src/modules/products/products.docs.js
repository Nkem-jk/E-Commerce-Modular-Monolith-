/**
 * @openapi
 * tags:
 *   - name: Products
 *     description: Browse, add, update and delete products
 *
 * components:
 *   schemas:
 *     Product:
 *       type: object
 *       properties:
 *         id:          { type: integer, example: 1 }
 *         name:        { type: string, example: Notebook }
 *         description: { type: string, nullable: true, example: A hardcover notebook with 200 pages }
 *         price:       { type: integer, description: Price in kobo, example: 150000 }
 *         imageUrl:    { type: string, example: https://example.com/notebook.jpg }
 *         stock:       { type: integer, example: 10 }
 *         createdAt:   { type: string, format: date-time }
 *         updatedAt:   { type: string, format: date-time }
 *
 *     ProductInput:
 *       type: object
 *       required: [name, price, imageUrl]
 *       properties:
 *         name:        { type: string, minLength: 2, maxLength: 100, example: Notebook }
 *         price:       { type: integer, description: Price in kobo, example: 150000 }
 *         stock:       { type: integer, minimum: 0, example: 10 }
 *         imageUrl:    { type: string, example: https://example.com/notebook.jpg }
 *         description: { type: string, example: A hardcover notebook with 200 pages }
 */

/**
 * @openapi
 * /products:
 *   get:
 *     tags: [Products]
 *     summary: Get all products
 *     responses:
 *       200:
 *         description: List of products
 *   post:
 *     tags: [Products]
 *     summary: Add a product (login required)
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       201:
 *         description: Product created
 *       400:
 *         description: Validation failed
 *       401:
 *         description: Authentication required
 *
 * /products/{id}:
 *   get:
 *     tags: [Products]
 *     summary: Get one product
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Product found
 *       404:
 *         description: Product not found
 *   put:
 *     tags: [Products]
 *     summary: Update a product (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ProductInput'
 *     responses:
 *       200:
 *         description: Product updated
 *       404:
 *         description: Product not found
 *   delete:
 *     tags: [Products]
 *     summary: Delete a product (login required)
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Product deleted
 *       404:
 *         description: Product not found
 *
 * /products/{id}/stock:
 *   get:
 *     tags: [Products]
 *     summary: Check whether a product is in stock
 *     parameters:
 *       - { in: path, name: id, required: true, schema: { type: integer } }
 *     responses:
 *       200:
 *         description: Stock status in data.inStock
 *       404:
 *         description: Product not found
 */