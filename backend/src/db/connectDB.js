import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `${process.env.MONGO_URI}/${process.env.DB_NAME}`
        );
        console.log(
            `Database connected at: ${connectionInstance.connection.host}`
        );
    } catch (error) {
        console.error("Error while connecting database ", error);
        process.exit(1);
    }
};
