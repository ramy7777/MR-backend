"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
// Get all rentals
router.get('/', auth_1.authenticate, async (req, res) => {
    // TODO: Implement get all rentals
    res.json([]);
});
// Get rental by id
router.get('/:id', auth_1.authenticate, async (req, res) => {
    // TODO: Implement get rental by id
    res.json({});
});
// Create rental
router.post('/', auth_1.authenticate, async (req, res) => {
    // TODO: Implement create rental
    res.status(201).json({});
});
// Update rental
router.put('/:id', auth_1.authenticate, async (req, res) => {
    // TODO: Implement update rental
    res.json({});
});
// Delete rental
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    // TODO: Implement delete rental
    res.status(204).send();
});
exports.default = router;
//# sourceMappingURL=rentalRoutes.js.map