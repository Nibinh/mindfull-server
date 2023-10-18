const Admin = require("../models/authModel");
const bcrypt = require("bcryptjs");
const { generateOTP } = require("../services/otpConfig");
const { sendmail } = require("../services/mailConfig");
const JWT = require("jsonwebtoken");
const JWT_KEY = process.env.JWT_KEY;

///registration
const register = async (req, res) => {
  try {
    const {
      name,
      email,
      password,
      confirmpassword,
      phone,
      gender,
      how,
      city,
      state,
    } = req.body;

    const isExisting = await Admin.findOne({ email });
    if (isExisting) return res.status(400).send("Email already registered");

    if (
      !name ||
      !email ||
      !password ||
      !confirmpassword ||
      !phone ||
      !gender ||
      !how ||
      !city ||
      !state
    )
      return res.status(400).send("Fill all Feilds");

    if (password !== confirmpassword)
      return res.status(400).send("Password and Confirm Password dosent match");
    //hashing passsword
    const salt = await bcrypt.genSalt(10);
    const hashpassword = await bcrypt.hash(password, salt);

    const otpGenerated = generateOTP();

    const data = await Admin.create({
      name,
      email,
      password: hashpassword,
      phone,
      gender,
      how,
      city,
      state,
      otp: otpGenerated,
    });
    if (!data) return res.status(400).send("unable to create");

    // mail sending
    const mail = await sendmail({
      to: email,
      OTP: otpGenerated,
    });
    if (!mail) return res.status(400).send("OTP didnt send");

    return res
      .status(200)
      .json({ message: "OTP sended to your mail", mail: data.email });
  } catch (error) {
    res.status(500).json({ error: "An error Occured" + error.message });
  }
};

const verifyUserWithOTP = async (req, res) => {
  try {
    const { email, otp } = req.body;
    const user = await Admin.findOne({ email });
    if (!user) return res.status(400).send("User not Found");

    if (user && user.otp !== otp) return res.status(400).send("Invalid OTP");

    const updateUser = await Admin.findByIdAndUpdate(user._id, {
      $set: { active: true },
    });

    return res.status(200).send("Account Created Successfully");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    //Checking all feilds are available
    if (!email || !password) return res.status(400).send("Fill al the feilds");
    //checking is email is registered or not
    const data = await Admin.findOne({ email, active: true });
    if (!data) return res.status(400).send("User not Found");
    //comparing passwords
    const isMatch = await bcrypt.compare(password, data.password);
    if (!isMatch) return res.status(400).send("Invalid Credentials");
    //generate JWT
    const token = JWT.sign({ email: data.email }, JWT_KEY, {
      expiresIn: "2hr",
    });
    if (!token) return res.status(200).send("Token not generated");

    res
      .cookie("token", token, { httpOnly: true, secure: true })
      .status(200)
      .json({
        message: "login Successfull",
        email: data.email,
        name: data.name,
        id: data._id,
      });
  } catch (error) {
    console.log(error);
  }
};
module.exports = {
  register,
  verifyUserWithOTP,
  loginUser,
};
