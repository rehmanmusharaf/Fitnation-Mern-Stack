const express = require("express");
const cookieParser = require("cookie-parser");
const app = express();
const port = process.env.PORT || 8080;
const dotenv = require("dotenv");
const fitnessstat = require("./Controlers/fitnessstat.js");
const dietplan = require("./Controlers/dietplan.js");
// const cors = require("cors");
dotenv.config();

// const corsOptions = {
//   origin: "http://localhost:3000",
//   credentials: true, //access-control-allow-credentials:true
//   optionSuccessStatus: 200,
// };
// corsOptions
const cors = require("cors");
const corsOptions = {
  origin: "http://localhost:3000",
  methods: "GET,HEAD,PUT,PATCH,POST,DELETE",
  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions)); // Use cors middleware
// app.use(cors());
const path = require("path");
app.use("/", express.static("uploads"));
const user = require("./Controlers/user.js");
const { connecttodb } = require("./db/Db.js");
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
require("dotenv").config();
connecttodb();

app.get("/", (req, res) => {
  // console.log(process.env.REACT_APP_URL);
  res.send("Hello World!");
});

app.post("/api/create-user", user);
app.post("/api/activation", user);
app.post("/api/login", user);
app.get("/getuser", user);
app.get("/user/logout", user);
app.get("/getallusers", user);
app.get("/getvotedusers", user);
app.get("/getpublicvotedusers", user);
app.post("/api/dietregister", dietplan);
app.delete("/api/deletediet/:name", dietplan);
app.get("/api/dietplans", dietplan);
app.post("/api/registerProgress", fitnessstat);
app.post("/api/updateprogress", fitnessstat);
app.get("/api/getprogress", fitnessstat);
app.put("/activateuseracount", user);
app.put("/deactivateuseracount", user);
app.get("/getallusers", user);
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
