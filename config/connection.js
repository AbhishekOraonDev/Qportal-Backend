
import mongoose from 'mongoose';

export const connectDB = async () => {
    try {
        // console.log(process.env.DB_uri);
        await mongoose.connect(process.env.DB_uri, {
            dbName: 'Qportal'
        });
        console.log('Connected to Database.');
    } catch(err) {
        console.error('Error connecting to the database:', err);
        throw err; 
    }
};

