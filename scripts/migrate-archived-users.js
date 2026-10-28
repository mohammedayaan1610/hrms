import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import mongoose from "mongoose";
import connectDB from "../src/lib/mongodb.js";
import User from "../src/models/User.js";
import ArchivedUser from "../src/models/ArchivedUser.js";

async function main() {
  await connectDB();

  const dbSession = await mongoose.startSession();
  const migrated = [];
  const skipped = [];

  try {
    await dbSession.withTransaction(async () => {
      const legacyRecords = await User.find({
        role: "employee",
        isActive: false,
      })
        .select("+passwordHash")
        .session(dbSession);

      for (const user of legacyRecords) {
        const conflict = await ArchivedUser.findOne({
          $or: [
            { _id: user._id },
            { employeeId: user.employeeId },
            { email: user.email },
          ],
        }).session(dbSession);

        if (conflict) {
          skipped.push({
            employeeId: user.employeeId,
            reason: "Matching archived record already exists",
          });
          continue;
        }

        const data = user.toObject();
        delete data.__v;
        data.isActive = false;
        data.deletedAt = data.deletedAt || new Date();

        await ArchivedUser.create([data], { session: dbSession });

        const deletion = await User.deleteOne(
          { _id: user._id, role: "employee", isActive: false },
          { session: dbSession }
        );

        if (deletion.deletedCount !== 1) {
          throw new Error(
            `Could not remove legacy record ${user.employeeId}; transaction aborted`
          );
        }

        migrated.push({
          employeeId: user.employeeId,
          name: user.name,
        });
      }
    });

    console.log(JSON.stringify({
      success: true,
      migrated,
      skipped,
      message: "Migration transaction completed.",
    }, null, 2));
  } finally {
    await dbSession.endSession();
    await mongoose.disconnect();
  }
}

main().catch((error) => {
  console.error("Migration failed; transaction should be rolled back:", error);
  process.exitCode = 1;
});
