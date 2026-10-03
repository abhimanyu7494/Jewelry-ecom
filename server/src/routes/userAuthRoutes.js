const express = require("express");

const router = express.Router();

const {
  sendRegistrationOTP,
  verifyRegistrationOTP,
  completeRegistration,
  userLogin,
} = require("../controllers/userAuthController");

router.post("/register/send-otp", sendRegistrationOTP);

router.post("/register/verify-otp", verifyRegistrationOTP);

router.post("/register/complete", completeRegistration);

router.post("/login", userLogin);


module.exports = router;
