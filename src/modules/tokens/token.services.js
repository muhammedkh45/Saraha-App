import cron from "node-cron";
import revokeTokenModel from "../../DB/models/revoke-token.model.js";
export const deleteRevokedTokens = cron.schedule(
  "0 0 * * *",
  async () => {
    console.log(
      `[CRON] Running daily token cleanup at ${new Date().toISOString()}`
    );

    try {
      const deletedCount = await revokeTokenModel.deleteMany({});
      console.log(`[CRON] Deleted ${deletedCount} revoked tokens`);
    } catch (err) {
      throw new Error(`[CRON] Token cleanup failed: ${err.message}`, {
        cause: 500,
      });
    }
  },
  {
    scheduled: true,
    timezone: "UTC",
  }
);
