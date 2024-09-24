const router = require("express").Router();
const validate = require("../../middleware/validate");
const { createNotificationV } = require("./notificationValidation");
const notificationController = require("./notificationController");
const methodNotAllowed = require("../../middleware/methodNotAllowed");

router
    .route("/")
    .post(
        [validate(createNotificationV)],
        notificationController.createNotification
    )
    .all(methodNotAllowed);
router
    .route("/all-notifications")
    .get(notificationController.getNotifications)
    .all(methodNotAllowed);

router
    .route("/:userId")
    .get(notificationController.getNotificationById)
    .all(methodNotAllowed);

module.exports = router;


// const router = require("express").Router();
// const validate = require("../../middleware/validate");
// const { createNotificationV } = require("./notificationValidation");
// const notificationController = require("./notificationController");
// const auth = require("../../middleware/authentication");
// const { ROLES } = require("../../common/utils/constants");
// const methodNotAllowed = require("../../middleware/methodNotAllowed");

// router
//     .route("/")
//     .post(
//         [auth(ROLES.USER), validate(createNotificationV)],
//         notificationController.createNotification
//     )
//     .all(methodNotAllowed);

// router
//     .route("/all-notifications")
//     .get(auth(ROLES.ALL), notificationController.getNotifications)
//     .all(methodNotAllowed);

// router
//     .route("/user/:userId")
//     .get(auth(ROLES.ALL), notificationController.getNotificationById)
//     .all(methodNotAllowed);

// module.exports = router;

