const mongoose = require("mongoose");

const coursesSchema = new mongoose.Schema({
  title: {
    type: String,
  },
  teacherId: {
    type: String,
    required: true
  },

});
const Courses = mongoose.model("courses", coursesSchema);
module.exports = Courses;
