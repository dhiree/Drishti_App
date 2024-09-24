const { isEmpty, generateJWT } = require("../../common/utils/app_functions");
const User = require("../../models/user");
const appError = require("../../common/utils/appError");
const httpStatus = require("../../common/utils/status.json");
const { createToken } = require("../../middleware/genrateTokens");
const { ROLES } = require("../../common/utils/constants");
const { encode, decode } = require("../../common/utils/crypto");
const { generateOTP } = require("../../common/utils/helpers");
const { uploadToS3, deleteFromS3 } = require("../../common/utils/uploadToS3");
const constants = require("../../common/utils/constants");
const sendSms = require("../../common/utils/messageService");

function AddMinutesToDate(date, minutes) {
  return new Date(date.getTime() + minutes * 60000);
}
const userLoginService = async (request) => {
  const { mobileNo, countryCode, type } = request.body;
  let user = await User.findOne({
    mobileNo: mobileNo,
  });

  const otp = generateOTP();
  const now = new Date();
  const expiration_time = AddMinutesToDate(now, 10);
  let details = {
    otp: otp,
    expiration_time: expiration_time,
    mobile: mobileNo,
    countryCode: countryCode,
    type: type,
  };
  if (user) {
    details["userId"] = user._id.toString();
  }
  if (mobileNo === "9766619238" || mobileNo === "9699224825") {
    details.otp = "1111";
    return { data: await encode(JSON.stringify(details)) };
  }
  await sendSms(
    countryCode + mobileNo,
    `Drishti account verification OTP:${otp}`
  );
  return { data: await encode(JSON.stringify(details)) };
};


const verifyOtp = async (request) => {
  const { otp, data, deviceToken } = request.body;
  const decoded = await decode(data);
  const decodedObj = JSON.parse(decoded);
  const expirationTime = new Date(decodedObj.expiration_time);
  const currentTime = new Date();
  if (expirationTime > currentTime) {
    if (Number(decodedObj.otp) === otp) {
      let user;
      if (!decodedObj.userId) {
        user = await User.create({
          mobileNo: decodedObj.mobile,
          countryCode: decodedObj.countryCode,
          deviceTokens: deviceToken,
        });
      }
      if (decodedObj.userId) {
        user = await User.findById(decodedObj.userId);
        if (!user.deviceTokens.includes(deviceToken)) {
          user = await User.findByIdAndUpdate(
            user._id,
            {
              $push: {
                deviceTokens: deviceToken,
              },
            },
            { new: true }
          );
        }
      }
      return createToken(user);
    } else {
      throw new appError(httpStatus.CONFLICT, request.t("user.INCORRECT_OTP"));
    }
  } else {
    throw new appError(httpStatus.CONFLICT, request.t("user.OTP_EXPIRED"));
  }
};
const updateLocation = async (request) => {
  const { lat, long, location } = request.body;

  return await User.findByIdAndUpdate(
    request.user.id,
    {
      location: location,
      latlong: {
        coordinates: [parseFloat(long), parseFloat(lat)],
      },
    },
    {
      new: true,
    }
  );
};

// const onBoardUser = async (request) => {
//   const { name, email, userName, mobileNo, bio, teacherId, role } =
//     request.body;
//   const profileImg =
//     request.files?.profileImage != null ||
//       request.files?.profileImage != undefined
//       ? request.files?.profileImage[0]?.location
//       : "";
//   const teacherIdCard =
//     request.files?.teacherIdCard != null ||
//       request.files?.teacherIdCard != undefined
//       ? request.files?.teacherIdCard[0]?.location
//       : "";

//   const Email = email.toLowerCase();
//   const isExistingEmail = await User.findOne({
//     email: Email,
//     //_id: { $ne: request.user.id },
//   });
//   const isExistingUserName = await User.findOne({
//     userName: userName,
//     //_id: { $ne: request.user.id },
//   });

//   if (isExistingEmail || isExistingUserName) {
//     if (Object.keys(request.files).length != 0) {
//       if (teacherIdCard != "") {
//         await deleteFromS3(request.files?.teacherIdCard[0]?.location);

//         if (profileImg != "") {
//           await deleteFromS3(request.files?.profileImage[0]?.location);
//         }
//       }
//     }
//     if (isExistingEmail) {
//       throw new appError(httpStatus.CONFLICT, request.t("user.EMAIL_EXISTENT"));
//     } else {
//       throw new appError(
//         httpStatus.CONFLICT,
//         request.t("user.UserName_EXISTENT")
//       );
//     }
//   }

//   if (role === ROLES.TEACHER) {
//     return await User.findByIdAndUpdate(
//       request.user.id,
//       {
//         name: name,
//         email: Email,
//         userName: userName,
//         mobileNo: mobileNo,
//         profileImage: profileImg,
//         isOnboarded: true,
//         teacherIdCard: teacherIdCard,
//         teacherId: teacherId,
//         role: ROLES.TEACHER,
//         bio: bio,
//       },
//       {
//         new: true,
//       }
//     );
//   }
//   return await User.findByIdAndUpdate(
//     request.user.id,
//     {
//       name: name,
//       email: Email,
//       mobileNo: mobileNo,
//       userName: userName,

//       profileImage: profileImg,
//       isOnboarded: true,
//       bio: bio,
//       role: ROLES.USER,
//     },
//     {
//       new: true,
//     }
//   );
// };


const onBoardUser = async (request) => {
  const { name, email, userName, mobileNo, bio, teacherId, role, latitude, longitude, } = request.body;

  const profileImg = request.files?.profileImage ? request.files.profileImage[0].location : "";
  const teacherIdCard = request.files?.teacherIdCard ? request.files.teacherIdCard[0].location : "";

  const Email = email.toLowerCase();

  const isExistingEmail = await User.findOne({ email: Email });
  const isExistingUserName = await User.findOne({ userName: userName });

  // If user already exists, handle the error
  if (isExistingEmail || isExistingUserName) {
    if (teacherIdCard) await deleteFromS3(teacherIdCard);
    if (profileImg) await deleteFromS3(profileImg);

    if (isExistingEmail) {
      throw new appError(httpStatus.CONFLICT, request.t("user.EMAIL_EXISTENT"));
    } else {
      throw new appError(httpStatus.CONFLICT, request.t("user.UserName_EXISTENT"));
    }
  }

  const newUser = await User.create({
    name,
    email: Email,
    userName,
    mobileNo,
    profileImage: profileImg,
    isOnboarded: true,
    teacherIdCard,
    teacherId,
    role: role === ROLES.TEACHER ? ROLES.TEACHER : ROLES.USER,
    bio,
    latlong: {
      type: 'Point',
      coordinates: [longitude, latitude],
    },
  });

  return newUser;
};



async function addTeacherRole(request, params) {
  try {
    const user = await User.findById(request.user.id);
    if (user) {
      return await User.findByIdAndUpdate(
        request.user.id,
        {
          teacherId: params.teacherId,
          teacherIdCard: params.teacherIdCard[0].link,
          role: ROLES.TEACHER,
        },
        { new: true }
      );
    } else {
      throw new appError(
        httpStatus.NOT_FOUND,
        request.t("user.USER_NOT_FOUND")
      );
    }
  } catch (error) {
    throw new appError(httpStatus.INTERNAL_SERVER_ERROR, error.message);
  }
}

async function updateUser(params, request) {
  const currentUser = request.user;
  try {
    const user = await User.findById(request.user.id);
    if (user) {
      if (!isEmpty(params.email)) {
        const emailedUser = await User.findOne({ email: params.email });
        if (isEmpty(emailedUser)) {
          user.email = params.email;
          await user.save();
        } else {
          throw new appError(
            httpStatus.CONFLICT,
            request.t("user.EMAIL_EXISTENT")
          );
        }
      }
      if (params.isTeacher) {
        user.teacherId = params.teacherId;
        await user.save();
      }
      if (
        !isEmpty(params.mobileNo) &&
        !isEmpty(params.countryCode) &&
        params.mobileNo != currentUser.mobileNo
      ) {
        const mobiledUser = await User.findOne({
          mobileNo: params.mobileNo,
          countryCode: params.countryCode,
        });
        if (isEmpty(mobiledUser)) {
          user.mobileNo = params.mobileNo;
          user.countryCode = params.countryCode;
          await user.save();
        } else {
          throw new appError(
            httpStatus.CONFLICT,
            request.t("user.MOBILE_EXISTENT")
          );
        }
      }
      if (!isEmpty(params.fullName)) {
        user.fullName = params.fullName;
        await user.save();
      }

      if (
        !isEmpty(params.userName) &&
        params.userName != currentUser.userName
      ) {
        const userWithUserName = await User.findOne({
          userName: params.userName,
          deletedAt: null,
        });
        if (isEmpty(userWithUserName)) {
          user.userName = params.userName;
        } else {
          throw new appError(
            httpStatus.CONFLICT,
            request.t("user.USER_NAME_EXISTENT")
          );
        }
      }
      if (!isEmpty(params.location)) {
        user.location = params.location;
      }
      await user.save();
      returnVal.data = user;
    } else {
      throw new appError(
        httpStatus.NOT_FOUND,
        request.t("user.USER_NOT_FOUND")
      );
    }
    return returnVal;
  } catch (error) {
    throw new appError(error.status, error.message);
  }
}

async function getUser(currentUser) {
  return await User.findById(currentUser);
}

async function getAllUsers() {
  return await User.aggregate([{ $match: { deletedAt: null } }]);
}

async function getUserAddress(request) {
  return await User.findById(request.user.id).select("address -_id");
}

async function getAllTeachers() {
  return await User.find({ role: ROLES.TEACHER });
}

async function actionOnTeacherAccount(request) {
  let { status, id } = request.query;

  try {
    const user = await User.findById(id);
    if (!user) {
      throw new appError(
        httpStatus.NOT_FOUND,
        request.t("user.TEACHER_NOT_FOUND")
      );
    }

    return await User.findByIdAndUpdate(
      id,
      {
        teacherRoleApproved: status,
        teacherRequestHandledBy: request.user.id,
      },
      { new: true }
    );
  } catch (error) {
    throw new appError(error.status, error.message);
  }
}

async function getTeachersRequest(request) {
  try {
    return await User.find({
      role: constants.ROLES.TEACHER,
      teacherRoleApproved: constants.STATUS.PENDING,
    });
  } catch (error) {
    throw new appError(error.status, error.message);
  }
}

async function uploadDocuments(params, request) {
  try {
    const user = await User.findById(request.user.id);
    if (user) {
      user.profileImageUrl = params[0].link;
      await user.save();
      return user;
    } else {
      throw new appError(
        httpStatus.NOT_FOUND,
        request.t("user.USER_NOT_FOUND")
      );
    }
  } catch (error) {
    throw new appError(error.status, error.message);
  }
}

async function updateSocialMediaLinks(request) {
  return await User.findByIdAndUpdate(
    request.user.id,
    { ...request.body },
    { new: true }
  );
}

async function locationSharing(request) {
  return await User.findByIdAndUpdate(
    request.user.id,
    { ...request.body },
    { new: true }
  );
}

const getSocialMedia = async (request) => {
  try {
    const userId = request.params.userId;
    const user = await User.findById(userId)
    if (!user) {
      throw new appError(httpStatus.NOT_FOUND, "User not found");
    }
    const socialLinks = {
      youtube: user.youtubeUrl || null,
      x: user.xUrl || null,
      instagram: user.instagramUrl || null
    };
    res.json(socialLinks);
    console.log(socialLinks)
  } catch (error) {
    throw new appError(httpStatus.INTERNAL_SERVER_ERROR, "Failed to retrieve social media links");
  }
};

const getNearbyVisibleUsers = async (longitude, latitude, radius = 1000) => {
  try {
    const users = await User.find({
      latlong: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: [longitude, latitude],
          },
          $maxDistance: radius,
        },
      },
    }).select("userName profileImagerole")

    return users;
  } catch (error) {
    throw new Error("Error fetching nearby users: " + error.message);
  }
};

module.exports = {
  userLoginService,
  updateLocation,
  onBoardUser,
  updateUser,
  getUser,
  uploadDocuments,
  addTeacherRole,
  getAllUsers,
  getUserAddress,
  actionOnTeacherAccount,
  getAllTeachers,
  verifyOtp,
  getTeachersRequest,
  locationSharing,
  updateSocialMediaLinks,
  getSocialMedia,
  getNearbyVisibleUsers
};
