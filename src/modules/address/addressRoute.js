const express = require("express");
const router = express.Router();
const {
  createAddressController,
  getAddressController,
  updateAddressController,
  deleteAddressController,
} = require("../address/addressController");
const validate = require("../../middleware/validate");
const auth = require("../../middleware/authentication");

const {
  addressCreateV,
  addressUpdateV,
} = require("../address/addressValidation");
const methodNotAllowed = require("../../middleware/methodNotAllowed");
const { ROLES } = require("../../common/utils/constants");

router
  .route("/create")
  .post(
    //auth(ROLES.WITHOUT_GUEST),
    // validate(addressCreateV),
    createAddressController
  )
  .all(methodNotAllowed);

router
  .route("/delete/:id")
  .delete(auth(ROLES.WITHOUT_GUEST), deleteAddressController)
  .all(methodNotAllowed);

router
  .route("/edit/:id")
  .patch(
    auth(ROLES.WITHOUT_GUEST),
    validate(addressUpdateV),
    updateAddressController
  )
  .all(methodNotAllowed);

router
  .route("/all")
  .get(auth(ROLES.WITHOUT_GUEST), getAddressController)
  .all(methodNotAllowed);

module.exports = router;
