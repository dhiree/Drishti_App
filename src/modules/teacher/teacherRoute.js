const router = require("express").Router();
const teacherController = require("./teacherController");
const validate = require("../../middleware/validate");
const methodNotAllowed = require("../../middleware/methodNotAllowed");
const { deleteCourse, updateProfile, getProfileById } = require("./teacherValidation");

router
    .route("/courses/:teacherId")
    .get(
        validate(getProfileById),
        teacherController.getCoursesByTeacherId
    )
    .all(methodNotAllowed);

router
    .route("/courses/:teacherId/:courseId")
    .patch(
        validate(updateProfile),
        teacherController.updateCourseByTeacherId
    )
    .all(methodNotAllowed);

router
    .route("/courses/delete/:teacherId/:courseId")
    .delete(
        validate(deleteCourse),
        teacherController.deleteCourseByTeacherId
    )
    .all(methodNotAllowed);

module.exports = router;
