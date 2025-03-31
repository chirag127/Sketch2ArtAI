const cron = require("node-cron");
const Credit = require("../models/Credit");
const User = require("../models/User");

const FREE_CREDITS_PER_MONTH = 100;

// Function to renew credits for a single user
const renewUserCredits = async (userId) => {
    try {
        let credit = await Credit.findOne({ user: userId });

        if (!credit) {
            // Create new credit record if it doesn't exist
            credit = new Credit({
                user: userId,
                balance: FREE_CREDITS_PER_MONTH,
                lastFreeCreditsDate: new Date(),
            });
        } else {
            // Check if it's been a month since last free credits
            const lastFreeCredits = new Date(credit.lastFreeCreditsDate);
            const currentDate = new Date();
            const monthDiff =
                (currentDate.getFullYear() - lastFreeCredits.getFullYear()) *
                    12 +
                (currentDate.getMonth() - lastFreeCredits.getMonth());

            if (monthDiff >= 1) {
                credit.balance += FREE_CREDITS_PER_MONTH;
                credit.lastFreeCreditsDate = currentDate;
            }
        }

        await credit.save();
        console.log(`Credits renewed for user ${userId}`);
    } catch (error) {
        console.error(`Error renewing credits for user ${userId}:`, error);
    }
};

// Function to renew credits for all users
const renewAllUserCredits = async () => {
    try {
        console.log("Starting monthly credit renewal...");
        const users = await User.find({});

        for (const user of users) {
            await renewUserCredits(user._id);
        }

        console.log("Monthly credit renewal completed");
    } catch (error) {
        console.error("Error in monthly credit renewal:", error);
    }
};

// Schedule credit renewal to run at midnight on the first day of each month
const scheduleCreditRenewal = () => {
    // '0 0 1 * *' = At 00:00 on day-of-month 1
    cron.schedule("0 0 1 * *", renewAllUserCredits, {
        scheduled: true,
        timezone: "UTC",
    });

    console.log("Credit renewal task scheduled");
};

// Export both the scheduler and the renew function for manual triggers
module.exports = {
    scheduleCreditRenewal,
    renewAllUserCredits,
};
