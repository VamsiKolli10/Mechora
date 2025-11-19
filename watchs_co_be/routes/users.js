const express = require("express");
const usersController = require("../controllers/userController");
const { requireAuth, requireAdmin } = require("../middleware/authMiddleware");
const { validateRequest } = require("../middleware/validateRequest");
const { adminUserSchemas } = require("../validation/schemas");

const router = express.Router();

router.get("/", requireAuth, requireAdmin, usersController.getUsers);
router.get("/me", requireAuth, usersController.getMe);
router.get(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(adminUserSchemas.byId),
  usersController.getUser
);
router.post(
  "/",
  requireAuth,
  requireAdmin,
  validateRequest(adminUserSchemas.create),
  usersController.createUser
);
router.put(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(adminUserSchemas.update),
  usersController.updateUser
);
router.delete(
  "/:id",
  requireAuth,
  requireAdmin,
  validateRequest(adminUserSchemas.delete),
  usersController.deleteUser
);

module.exports = router;
