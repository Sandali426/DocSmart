import express from 'express';
import { 
    loginAdmin, 
    appointmentsAdmin, 
    appointmentCancel, 
    addDoctor, 
    allDoctors, 
    deleteDoctor,
    adminDashboard 
} from '../controllers/adminController.js';
import { changeAvailablity } from '../controllers/doctorController.js';
import authAdmin from '../middleware/authAdmin.js';
import upload from '../middleware/multer.js';

const adminRouter = express.Router();

// Public route
adminRouter.post("/login", loginAdmin);

// Protected routes (admin only)
adminRouter.use(authAdmin);

adminRouter.post("/add-doctor", upload.single('image'), addDoctor);
adminRouter.get("/appointments", appointmentsAdmin);
adminRouter.post("/cancel-appointment", appointmentCancel);
adminRouter.get("/all-doctors", allDoctors);
adminRouter.delete("/doctor/:id", deleteDoctor); // New delete route
adminRouter.post("/change-availability", changeAvailablity);
adminRouter.get("/dashboard", adminDashboard);

export default adminRouter;