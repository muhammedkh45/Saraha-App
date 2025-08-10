import connectDB from "./DB/connectionDB.js";
import userRouter from "./modules/users/users.controller.js";
import noteRouter from "./modules/notes/notes.controller.js";
import globalErrorHandler from "../src/middleware/globalErrorHandler.js";
import cors from "cors";
import  "./modules/tokens/token.services.js";

var whitelist = ["http://localhost:4200",undefined ];
var corsOptions = {
  origin: function (origin, callback) {
    if (whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("not allowed by cors"));
    }
  },
};
const bootstrap = (app, express) => {
  app.use("/uploads",express.static("uploads"))
  app.use(cors(corsOptions));
  app.use(express.json());

  connectDB();
  app.use("/users", userRouter);
  app.use("/notes", noteRouter);
  app.use("{/*demo}", (req, res, next) => {
    return res.status(404).send("page not found");
  });
  app.use(globalErrorHandler);
};
export default bootstrap;
