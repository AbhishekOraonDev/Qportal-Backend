import dotenv from "dotenv";
dotenv.config();
import express from "express";
import bodyParser from "body-parser";
import { config } from "dotenv";
import ErrorMiddleware from "./middleware/Error.js";
import cookieParser from "cookie-parser";
import cors from "cors";

// importing and using routes
import userRoutes from "./routes/users.js";
import paperRoutes from "./routes/paper.js";
import noteRoutes from "./routes/notesRoute.js";
import roleRoutes from "./routes/roleRoute.js";
import permissionRoutes from "./routes/permissionRoute.js";
import moduleRoutes from "./routes/moduleRoute.js";

// DB Connection
import { connectDB } from "./config/connection.js";

// PORT variable
const PORT = process.env.PORT || 5000;

config({
    path: "./config/config.env",
});
const app = express();

app.use(cors({ origin: 'http://localhost:3000', credentials: true }));  // for cross platform resource sharing
app.use(cookieParser());                                                // for cookie storage
app.use(bodyParser.json());                                             // for parsing request body


app.use("/api/users", userRoutes);
app.use("/api/papers", paperRoutes);
app.use("/api/notes", noteRoutes);
app.use("/api/role", roleRoutes);
app.use("/api/permission", permissionRoutes);
app.use("/api/module", moduleRoutes);

app.use(ErrorMiddleware);                                               // global error middleware 

// Default home route
app.get('/v1', (req, res) => {
    try{
        res.status(200).json({
            status: "success",
            data: [],
            message: "Welcome to Api Home Page, this is developed by Abhishek !",
        });
    } catch (error){
        res.status(500).json({
            status: "Error",
            message: "Internal Server Error",
        });
    }
});

connectDB();  //Connnecting DB

app.listen(PORT, ()=> {
    console.log(`server running on PORT ${PORT}`)
});

export default app;
