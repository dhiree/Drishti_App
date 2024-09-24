const addressService = require("../address/addressService");
const appError = require("../../common/utils/appError");
const createResponse = require("../../common/utils/createResponse");
const httpStatus = require("../../common/utils/status.json");

const createAddressController = async (request, response) => {
  try {
    const data = await addressService.createAddressService(request);
    if (!data) {
      throw new appError(
        httpStatus.CONFLICT,
        request.t("address.UNABLE_TO_CREATE")
      );
    }
    createResponse(
      response,
      httpStatus.OK,
      request.t("address.ADDRESS_CREATED"),
      data
    );
  } catch (error) {
    createResponse(response, error.status, error.message);
  }
};

const getAddressController = async (request, response) => {
  try {
    const data = await addressService.getAddressService(request);
    if (!data) {
      throw new appError(httpStatus.NOT_FOUND, request.t("address.NOT_FOUND"));
    }
    createResponse(
      response,
      httpStatus.OK,
      request.t("address.ADDRESS_FOUND"),
      data
    );
  } catch (error) {
    createResponse(response, error.status, error.message);
  }
};

const updateAddressController = async (request, response) => {
  try {
    const data = await addressService.updateAddressService(request);
    if (!data) {
      throw new appError(
        httpStatus.CONFLICT,
        request.t("address.UNABLE_TO_UPDATE")
      );
    }
    createResponse(
      response,
      httpStatus.OK,
      request.t("address.ADDRESS_UPDATED"),
      data
    );
  } catch (error) {
    createResponse(response, error.status, error.message);
  }
};

const deleteAddressController = async (request, response) => {
  try {
    const data = await addressService.deleteAddressService(request);
    if (!data) {
      throw new appError(
        httpStatus.NOT_FOUND,
        request.t("address.UNABLE_TO_DELETE")
      );
    }
    createResponse(
      response,
      httpStatus.OK,
      request.t("address.ADDRESS_DELETED"),
      data
    );
  } catch (error) {
    createResponse(response, error.status, error.message);
  }
};

module.exports = {
  createAddressController,
  getAddressController,
  updateAddressController,
  deleteAddressController,
};

