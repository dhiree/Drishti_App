const Address = require("../../models/address");

async function createAddressService(request) {
  const { title, city, state, country, pin, address, userId, location } = request.body;
  const saveAddress = new Address({
    title,
    address,
    city,
    state,
    country,
    pin,
    location,
    userId,
  });
  console.log(saveAddress)
  return await saveAddress.save();
}

async function getAddressService(request) {
  const { id } = request.query;
  return id
    ? await Address.findById(id)
    : await Address.find({ userId: request.user.id });
}

async function updateAddressService(request) {
  const { id } = request.params;
  const updateData = request.body;
  if (updateData.lat && updateData.long) {
    updateData.location = {
      type: "Point",
      coordinates: [updateData.long, updateData.lat],
    };
    delete updateData.lat;
    delete updateData.long;
  }
  return await Address.findByIdAndUpdate(id, updateData, { new: true });
}

async function deleteAddressService(request) {
  const { id } = request.params;
  return await Address.findByIdAndDelete(id);
}

module.exports = {
  createAddressService,
  getAddressService,
  updateAddressService,
  deleteAddressService,
};

