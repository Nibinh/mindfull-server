const User = require("../models/userModel");

//Adding a user

const addingUser = async (req, res) => {
  try {
    const { name, email, phone, adminId } = req.body;

    const isExisting = await User.findOne({ email });
    if (isExisting)
      return res.status(400).send("Mail is already is registered");

    if (!name || !email || !phone || !adminId)
      return res.status(400).send("Fill all Feilds");

    const addData = await User.create({
      name,
      email,
      phone,
      createdBy: adminId,
    });
    if (!addData) return res.status(400).send("Cannot add User");

    return res.status(200).send("User Successfully Added");
  } catch (error) {
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

//getUser
const getUser = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findOne({ _id: id }).populate({
      path: "createdBy",
      select: "email name",
    });
    if (!user) return res.status(400).send("no user found");
    return res.status(200).json({ message: "User Found", user });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" + error.message });
  }
};

//get ALL Users
const getAllUsers = async (req, res) => {
  try {
    //filter
    let query;
    query = User.find().populate({ path: "createdBy", select: "email name" });

    //sorting logic
    if (req.query.sort) {
      query = query.sort(req.query.sort);
    } else {
      query = query.sort("-createdAt");
    }
    //paginatoin
    const page = req.query.page * 1 || 1;
    const limit = req.query.limit * 1 || 7;
    const skip = (page - 1) * limit;
    query = query.skip(skip).limit(limit);
    let ser = query;

    if (req.query.page) {
      const userCount = await User.countDocuments();
      if (skip >= userCount) {
        console.log(userCount);
        return res.status(400).send("Page not Found");
      }
    }
    const filter = {};
    if (req.query.search) {
      const regexQuery = new RegExp(req.query.search, "i");
      filter.$or = [{ name: regexQuery }, { email: regexQuery }];
    }
    query = query.find(filter);

    // if (req.query.search) {
    //   const search = {};
    //   search.name = { $regex: req.query.search, $options: "i" };
    //   query = query.find(search);
    //   console.log(query);
    // }

    const users = await query;

    return res.status(200).json({ message: "Data send", users });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" + error.message });
  }
};

//delete a user
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const dlt = await User.deleteOne({ _id: id });
    if (!dlt) return res.status(400).send("couldnt delete");
    return res.status(200).send("Deleted");
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occured" + error.message });
  }
};

//edit user
const editUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, phone } = req.body;

    const isExisting = await User.findOne({ _id: id });
    if (!isExisting) return res.status(400).send("User not found");

    const updatedData = await User.updateOne(
      { _id: id },
      {
        $set: {
          name,
          phone,
        },
      }
    );
    res.status(200).json({ message: "Updated", data: updatedData });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "An error occurred: " + error.message });
  }
};

module.exports = {
  addingUser,
  getUser,
  getAllUsers,
  deleteUser,
  editUser,
};
