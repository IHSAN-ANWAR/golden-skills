import mongoose from 'mongoose';
import User from '../models/User.js';

await mongoose.connect('mongodb+srv://admin:adminadmin@cluster0.f8u2bps.mongodb.net/GoldenSkill?retryWrites=true&w=majority');

const user = await User.findOne({ myReferralCode: { $exists: true, $ne: null } })
  .select('fullName email myReferralCode')
  .lean();

console.log(user);
await mongoose.disconnect();
