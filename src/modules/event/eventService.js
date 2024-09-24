const mongoose = require("mongoose");
const Event = require("../../models/event");
const { getDistance } = require("../../common/utils/app_functions");
const appError = require("../../common/utils/appError");
const httpStatus = require("../../common/utils/status.json");
const constants = require("../../common/utils/constants");
const User = require("../../models/user");
const Notification = require("../../models/notification");
const ObjectId = mongoose.Types.ObjectId;
async function createEvent(request) {
  const { coordinates, ...remainingBody } = request.body;
  return await Event.create({
    userId: request.user.id,
    ...remainingBody,
    "location.coordinates": coordinates,
  });
}

async function editEvent(request) {
  const { coordinates, ...remainingBody } = request.body;
  return await Event.findByIdAndUpdate(
    request.params.id,
    {
      userId: request.user.id,
      ...remainingBody,
      "location.coordinates": coordinates,
    },
    { new: true }
  );
}
async function deleteEvent(request) {
  return await Event.findByIdAndDelete(request.params.id);
}

async function getEvent(request) {
  return await Event.aggregate([
    { $match: { _id: new ObjectId(request.params.eventId) } },
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "teachers",
        foreignField: "_id",
        as: "teachersDetails",
      },
    },
  ]);
}
function getStartOfDayAndNextDay(inputDate) {
  console.log("inputDate: " + inputDate);
  const startOfDay = `${inputDate.split("T")[0]}T00:00:00.000Z`;
  const nextDay = new Date(inputDate);
  nextDay.setDate(nextDay.getDate() + 1);
  const startOfNextDay = `${inputDate.split("T")[0]}T18:29:59.000Z`;

  return [startOfDay, startOfNextDay];
}
async function getEvents(request) {
  console.log("user----------", request.user);
  const { mode, aol, course, date, lat, long, page, pageSize } = request.body;
  const pageSizeLimit = pageSize || 10;
  const pageNo = page || 1;
  let matchQuery = {};
  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "teachers",
        foreignField: "_id",
        as: "teachersDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "notifyTo",
        foreignField: "_id",
        as: "participantsDetails",
      },
    },
  ];
  if (course) {
    matchQuery["course"] = {
      $regex: new RegExp(course.trim()),
      $options: "i",
    };
  }

  if (date) {
    const [startOfDay, nextDay] = getStartOfDayAndNextDay(date);
    matchQuery["$and"] = [
      { "date.from": { $gte: new Date(startOfDay) } },
      // { time: { $lte: new Date(nextDay) } },
    ];
  } else {
    const [startOfDay, nextDay] = getStartOfDayAndNextDay(
      new Date().toISOString()
    );
    matchQuery["$and"] = [
      { "date.from": { $gte: new Date(startOfDay) } },
      // { time: { $lte: new Date(nextDay) } },
    ];
  }

  if (aol) {
    matchQuery["aol"] = {
      $in: [aol],
    };
  }
  if (mode) {
    matchQuery["mode"] = {
      $in: [mode],
    };
  }

  if (Object.keys(matchQuery).length !== 0) {
    const matchStage = { $match: matchQuery };
    pipeline.push(matchStage);
  }
  if (lat && long) {
    const { latitude: distortedLat, longitude: distortedLon } =
      distortCoordinates(parseFloat(lat), parseFloat(long));
    pipeline.unshift({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [distortedLon, distortedLat],
        },
        distanceField: "distanceInMeters",
        maxDistance: constants.MAX_DISTANCE_IN_MILES * 1609.34,
        spherical: true,
      },
    });
  }

  return await Event.aggregate([
    ...pipeline,
    {
      $unwind: "$duration",
    },
    {
      $group: {
        _id: "$duration.from",
        events: {
          $push: {
            _id: "$_id",
            title: "$title",
            participantsDetails: "$participantsDetails",
            mode: "$mode",
            aol: "$aol",
            userId: "$userId",
            dateFrom: "$date.from",
            dateTo: "$date.to",
            userDetails: "$userDetails",
            teachersDetails: "$teachersDetails",
            durationFrom: "$duration.from",
            durationTo: "$duration.to",
            meetingLink: "$meetingLink",
            recurring: "$recurring",
            description: "$description",
            address: "$address",
            phoneNumber: "$phoneNumber",
            registrationLink: "$registrationLink",
            location: "$location",
            teachers: "$teachers",
            notifyTo: "$notifyTo",
            distanceInKilometers: {
              $divide: ["$distanceInMeters", 1000],
            },
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by the "from" field in the duration array
    },
    {
      $skip: (pageNo - 1) * pageSizeLimit,
    },
    {
      $limit: pageSizeLimit,
    },
    {
      $project: {
        _id: 0,
        from: "$_id",
        events: 1,
      },
    },
  ]);
}

async function getHorizontalEvents(request) {
  const { mode, aol, course, date, lat, long, page, pageSize, fromTime } =
    request.body;
  const pageSizeLimit = pageSize || 10;
  const pageNo = page || 1;
  let matchQuery = {};
  const pipeline = [
    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "teachers",
        foreignField: "_id",
        as: "teachersDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "notifyTo",
        foreignField: "_id",
        as: "participantsDetails",
      },
    },
  ];
  if (course) {
    matchQuery["course"] = {
      $regex: new RegExp(course.trim()),
      $options: "i",
    };
  }

  if (date) {
    const [startOfDay, nextDay] = getStartOfDayAndNextDay(date);
    matchQuery["$and"] = [
      { "date.from": { $gte: new Date(startOfDay) } },
      // { time: { $lte: new Date(nextDay) } },
    ];
  } else {
    const [startOfDay, nextDay] = getStartOfDayAndNextDay(
      new Date().toISOString()
    );
    matchQuery["$and"] = [
      { "date.from": { $gte: new Date(startOfDay) } },
      // { time: { $lte: new Date(nextDay) } },
    ];
  }

  if (aol) {
    matchQuery["aol"] = {
      $in: [aol],
    };
  }
  if (mode) {
    matchQuery["mode"] = {
      $in: [mode],
    };
  }

  if (Object.keys(matchQuery).length !== 0) {
    const matchStage = { $match: matchQuery };
    pipeline.push(matchStage);
  }
  if (lat && long) {
    pipeline.unshift({
      $geoNear: {
        near: {
          type: "Point",
          coordinates: [parseFloat(long), parseFloat(lat)],
        },
        distanceField: "distanceInMeters",
        maxDistance: constants.MAX_DISTANCE_IN_MILES * 1609.34,
        spherical: true,
      },
    });
  }

  return await Event.aggregate([
    ...pipeline,
    {
      $unwind: "$duration",
    },
    {
      $match: {
        "duration.from": { $eq: fromTime },
      },
    },
    {
      $group: {
        _id: "$duration.from",
        events: {
          $push: {
            _id: "$_id",
            title: "$title",
            participantsDetails: "$participantsDetails",
            mode: "$mode",
            aol: "$aol",
            userId: "$userId",
            dateFrom: "$date.from",
            dateTo: "$date.to",
            userDetails: "$userDetails",
            teachersDetails: "$teachersDetails",
            durationFrom: "$duration.from",
            durationTo: "$duration.to",
            meetingLink: "$meetingLink",
            recurring: "$recurring",
            description: "$description",
            address: "$address",
            phoneNumber: "$phoneNumber",
            registrationLink: "$registrationLink",
            location: "$location",
            teachers: "$teachers",
            notifyTo: "$notifyTo",
            distanceInKilometers: {
              $divide: ["$distanceInMeters", 1000],
            },
          },
        },
      },
    },
    {
      $sort: { _id: 1 }, // Sort by the "from" field in the duration array
    },
    {
      $skip: (pageNo - 1) * pageSizeLimit,
    },
    {
      $limit: pageSizeLimit,
    },
    {
      $project: {
        _id: 0,
        from: "$_id",
        events: 1,
      },
    },
  ]);
}

async function getMyEvents(request) {
  return await Event.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(request.user.id),
      },
    },

    {
      $lookup: {
        from: "users",
        localField: "userId",
        foreignField: "_id",
        as: "userDetails",
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "teachers",
        foreignField: "_id",
        as: "teachersDetails",
      },
    },
  ]);
}

const getNotification = async (request) => {
  return await Notification.find({ to: request.user.id }).sort({ _id: -1 });
};

const getParticepents = async (request) => {
  return await Event.aggregate([
    { $match: { _id: new ObjectId(request.params.id) } },
    {
      $lookup: {
        from: "users",
        localField: "notifyTo",
        foreignField: "_id",
        as: "participantsDetails",
      },
    },
  ]).sort({ _id: -1 });
};

const notificatifyMe = async (request) => {
  let event = await Event.findById(request.params.id);
  if (!event) {
    throw new appError(httpStatus.CONFLICT, request.t("event.EVENT_NOT_FOUND"));
  }

  if (!event.notifyTo.includes(request.user.id)) {
    event = await Event.findByIdAndUpdate(
      request.params.id,
      {
        $push: {
          notifyTo: request.user.id,
        },
      },
      { new: true }
    );
  }
  return event;
};

async function getAttendedEvents(request) {
  const { page = 1, limit = 10 } = request.query;
  const userObjectId = mongoose.Types.ObjectId(request.user.id);
  const skip = (page - 1) * limit;

  return await Event.aggregate([
    {
      $match: {
        teachers: userObjectId,
        userId: { $ne: userObjectId },
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "teachers",
        foreignField: "_id",
        as: "teacherDetails",
      },
    },

    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
  ]);
}

const subscribeToEvent = async (eventId, userId, userName) => {
  const event = await Event.findById(eventId);

  if (!event) {
    throw new appError(httpStatus.NOT_FOUND, "Event not found");
  }

  if (!event.subscribers.some(sub => sub.userId.toString() === userId.toString())) {
    event.subscribers.push({ userId, name: userName });
    await event.save();
  }

  await Subscription.create({
    userId,
    eventId,
    name: userName
  });

  return { event, subscription: { userId, eventId, name: userName } };
};

const getSubscribersByEventId = async (eventId) => {
  try {

    const event = await Event.findById(eventId).populate({
      path: 'participants.userId',
      select: 'name',
    });

    if (!event) {
      throw new Error('Event not found');
    }

    return event.participants.map(participant => ({
      userId: participant.userId._id,
      name: participant.userId.name
    }));
  } catch (error) {
    throw new Error(error.message);
  }
};
module.exports = {
  getHorizontalEvents,
  createEvent,
  editEvent,
  deleteEvent,
  getEvent,
  getEvents,
  getMyEvents,
  getNotification,
  notificatifyMe,
  getParticepents,
  getAttendedEvents,
  subscribeToEvent,
  getSubscribersByEventId
};
