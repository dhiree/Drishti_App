const courseService = require("./courseService");
const createResponse = require("../../common/utils/createResponse");
const httpStatus = require("../../common/utils/status.json");

const getCoursesByTeacherId = async (request, response) => {
    try {
        const data = await courseService.getCoursesByTeacherId(request.params.teacherId);
        createResponse(response, httpStatus.OK, request.t("Course.CoursesFetched"), data);
    } catch (error) {
        createResponse(response, error.status || httpStatus.NOT_FOUND, error.message);
    }
};

const updateCourseByTeacherId = async (request, response) => {
    try {
        const data = await courseService.updateCourseByTeacherId(
            request.params.teacherId,
            request.params.courseId,
            request.body
        );
        createResponse(response, httpStatus.OK, request.t("Course.CourseUpdated"), data);
    } catch (error) {
        createResponse(response, error.status || httpStatus.BAD_REQUEST, error.message);
    }
};

const deleteCourseByTeacherId = async (request, response) => {
    try {
        const data = await courseService.deleteCourseByTeacherId(request.params.teacherId, request.params.courseId);
        createResponse(response, httpStatus.OK, request.t("Course.CourseDeleted"), data);
    } catch (error) {
        createResponse(response, error.status || httpStatus.NOT_FOUND, error.message);
    }
};

module.exports = {
    getCoursesByTeacherId,
    updateCourseByTeacherId,
    deleteCourseByTeacherId,
};
