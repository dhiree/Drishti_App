const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema({
    username:
    {
        type: String,
        required: true
    },
    fullName: {
        type: String,
        required: true
    },
    email: {
        type: String, required: true

    },
    mobileNo: {
        type: String,
        required: true
    },
    isArtOfLivingTeacher: {
        type: Boolean,
        required: true
    },
    teacherId: {
        type: String,
        required: function () { return this.isArtOfLivingTeacher; }
    },
    documentPath: {
        type: String,
        required: function () { return this.isArtOfLivingTeacher; }
    }
}, {
    timestamps: true

});


const Profile = mongoose.model("Profile", profileSchema);
module.exports = Profile;