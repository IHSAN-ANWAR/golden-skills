import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

async function dropIndex() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const collection = mongoose.connection.collection('courseplans');

    // List existing indexes
    const indexes = await collection.indexes();
    console.log('Current indexes:', indexes.map(i => i.name));

    // Drop the unique index on category if it exists
    const categoryIndex = indexes.find(i => i.key && i.key.category === 1);
    if (categoryIndex) {
      await collection.dropIndex(categoryIndex.name);
      console.log(`✅ Dropped index: ${categoryIndex.name}`);
    } else {
      console.log('ℹ️  No unique category index found (already removed or never existed)');
    }

    console.log('Done! Now multiple course plans per category are allowed.');
  } catch (err) {
    console.error('Error:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

dropIndex();
