const Joi = require("joi");

// Validation schema for creating a course by a teacher
const updateCourse = {
    body: Joi.object().keys({
        title: Joi.string().messages({
            "string.base": "Course title must be a string",
        }),
        teacherId: Joi.string().required().messages({
            "string.base": "Teacher ID must be a string",
            "string.empty": "Teacher ID is required",
            "any.required": "Teacher ID is required",
        }),
    }),
    params: Joi.object().keys({
        courseId: Joi.string().required().messages({
            "string.base": "Course ID must be a string",
            "any.required": "Course ID is required",
        }),
    }),
};

const deleteCourse = {
    params: Joi.object().keys({
        teacherId: Joi.string().required().messages({
            "string.base": "Teacher ID must be a string",
            "any.required": "Teacher ID is required",
        }),
        courseId: Joi.string().required().messages({
            "string.base": "Course ID must be a string",
            "any.required": "Course ID is required",
        }),
    }),
};

const getCoursesByTeacherId = {
    params: Joi.object().keys({
        teacherId: Joi.string().required().messages({
            "string.base": "Teacher ID must be a string",
            "any.required": "Teacher ID is required",
        }),
    }),
};

module.exports = {
    getCoursesByTeacherId,
    updateCourse,
    deleteCourse,

};
