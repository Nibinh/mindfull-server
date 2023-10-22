const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieparser = require("cookie-parser");

const server = express();

server.use(
  cors({
    // origin: "https://mindfull-client.onrender.com",
    origin: "http://localhost:3000",
    credentials: true,
  })
);
server.use(express.json());
server.use(cookieparser());
dotenv.config();

const PORT = process.env.PORT || 8000;
server.listen(PORT, () => {
  console.log(`Server started at ${PORT}`);
});

const authRoute = require("./routes/authRoutes");
const userRoute = require("./routes/userRoutes");

server.use("/auth", authRoute);
server.use("/user", userRoute);
