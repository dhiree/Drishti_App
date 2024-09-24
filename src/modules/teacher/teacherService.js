const Courses = require("../../models/courses");
const appError = require("../../common/utils/appError");
const httpStatus = require("../../common/utils/status.json");

const getCoursesByTeacherId = async (teacherId) => {
    const courses = await Courses.find({ teacherId });
    if (!courses || courses.length === 0) {
        throw new appError(httpStatus.NOT_FOUND, `No courses found for teacherId: ${teacherId}`);
    }
    return courses;
};

const updateCourseByTeacherId = async (teacherId, courseId, updateData) => {
    const course = await Courses.findOne({ _id: courseId, teacherId });
    if (!course) {
        throw new appError(httpStatus.NOT_FOUND, `Course not found for teacherId: ${teacherId}`);
    }

    const updatedCourse = await Courses.findByIdAndUpdate(courseId, updateData, { new: true });
    return updatedCourse;
};

const deleteCourseByTeacherId = async (teacherId, courseId) => {
    const course = await Courses.findOne({ _id: courseId, teacherId });
    if (!course) {
        throw new appError(httpStatus.NOT_FOUND, `Course not found for teacherId: ${teacherId}`);
    }

    await Courses.findByIdAndDelete(courseId);
    return { message: `Course with ID ${courseId} deleted successfully` };
};

module.exports = {
    getCoursesByTeacherId,
    updateCourseByTeacherId,
    deleteCourseByTeacherId,
};
