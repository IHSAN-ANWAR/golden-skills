import mongoose from 'mongoose';
import dotenv from 'dotenv';
import UserTask from '../models/UserTask.js';

dotenv.config();

async function rebuildIndexes() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB\n');

    console.log('🔨 Dropping old indexes...');
    await UserTask.collection.dropIndexes();
    console.log('✅ Old indexes dropped\n');

    console.log('🔨 Creating new optimized indexes...');
    await UserTask.createIndexes();
    console.log('✅ New indexes created\n');

    console.log('📊 Current indexes:');
    const indexes = await UserTask.collection.getIndexes();
    console.log(JSON.stringify(indexes, null, 2));

    console.log('\n✨ Index rebuild complete!');
    console.log('Your queries should now be much faster.\n');

    await mongoose.disconnect();
    console.log('🔌 Disconnected from MongoDB');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

rebuildIndexes();
