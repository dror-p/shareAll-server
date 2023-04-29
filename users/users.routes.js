const express = require("express");
const router = express.Router();
const config = require("../config/config");

const AuthMiddleware = require("../auth/middlewares/auth.middleware");
const PermissionsMiddleware = require("../users/middlewares/permissions.middlewares");
const UsersController = require("./controllers/users.controller");

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

router.get("/", [UsersController.list]);
router.get("/:userId", [
  AuthMiddleware.validJWTNeeded,
  UsersController.getById
]);
router.patch("/:userId", [
  AuthMiddleware.validJWTNeeded,
  PermissionsMiddleware.onlySameUserOrAdminCanDoThisAction,
  UsersController.patchById
]);
router.delete("/:userId", [
  AuthMiddleware.validJWTNeeded,
  PermissionsMiddleware.minimumPermissionLevelRequired(ADMIN),
  UsersController.removeById
]);
router.get("/getByEmail/:email", [
  //AuthMiddleware.validJWTNeeded,
  UsersController.getByEmail
]);
router.get("/:id/history/:product", [
  UsersController.addProductToHistory
]);

router.get("/:id/history", [
  UsersController.getUserProductHistory
]);

router.get("/rateById/:email",  UsersController.getByEmail);

router.post("/editRenterRate/:email/:newRate", UsersController.updateByEmail);


router.post("/userupdate", [UsersController.update]);
module.exports = router;
