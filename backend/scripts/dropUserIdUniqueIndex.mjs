import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

await mongoose.connect(process.env.MONGODB_URI);

const collection = mongoose.connection.collection('usercourseplansubmissions');

try {
  await collection.dropIndex('userId_1');
  console.log('✅ userId unique index dropped successfully');
} catch (err) {
  if (err.code === 27) {
    console.log('ℹ️  Index not found — already removed or never existed');
  } else {
    console.error('❌ Error dropping index:', err.message);
  }
}

await mongoose.disconnect();
console.log('Done.');
