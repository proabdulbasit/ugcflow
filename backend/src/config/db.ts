import mongoose from 'mongoose';

export async function connectDb(uri: string) {
  mongoose.set('strictQuery', true);
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 15_000,
    connectTimeoutMS: 15_000,
  });
  console.log('MongoDB connected');
}
