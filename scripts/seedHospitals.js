import 'dotenv/config';
import mongoose from 'mongoose';
import Hospital from '../models/Hospital.js';
import hospitals from '../data/hospitals.json' with { type: 'json' };
await mongoose.connect(process.env.MONGODB_URI);
await Hospital.deleteMany({});
await Hospital.insertMany(hospitals);
console.log(`Seeded ${hospitals.length} hospitals`);
await mongoose.disconnect();
