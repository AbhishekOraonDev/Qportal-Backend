import dotenv from "dotenv";
dotenv.config();

import app from "./app.js";
import {connectDB} from "./config/connection.js"

const PORT = process.env.PORT || 5000;

  // app.use(cors());

//   app.get("/", (req, res) => {
//     res.send("It is Working");
//   });

// //middleware to set routes
// app.use("/api", userRoutes);
connectDB();
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`)
});
