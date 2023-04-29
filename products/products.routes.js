const express = require("express");
const router = express.Router();
const config = require("../config/config");

const AuthMiddleware = require("../auth/middlewares/auth.middleware");

const PostPermissionMiddleware = require("../posts/middlewares/permissions.middleware");
const ProductController = require("./controllers/products.controller");
const { route } = require("../auth/auth.routes");

const ADMIN = config.permissionLevels.ADMIN;
const PAID = config.permissionLevels.PAID_USER;
const FREE = config.permissionLevels.NORMAL_USER;

router.get("/avragePrice", [ProductController.test]);
router.get("/:page?", [ProductController.list]);
router.get("/:id", [ProductController.getById]);
router.post("/",  [AuthMiddleware.validJWTNeeded, ProductController.insert]);
router.patch("/:id", [ //update
    ProductController.patchById
]);
router.post("/:id/rentRequest", [ProductController.rentRequest]);
router.get("/:id/groupRequest/:userId", [ProductController.groupRequest]);
router.post("/RequestApproval/:userId/:productid", [ProductController.RequestApproval])
router.get("/productsbyuser/:user", [ProductController.getByemail]);
router.post("/rentApprove/:productid", [ProductController.rentApprove]);
router.post("/getRentReqs/:userid", [ProductController.getRentReqs]);
module.exports = router;
