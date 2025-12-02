"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFilteredData = void 0;
const auth_1 = require("../middleware/auth");
const responseFormat_1 = require("../utils/responseFormat");
const AdminController_1 = require("./AdminController");
const getFilteredData = async (event) => {
    try {
        const checkAuth = await (0, auth_1.tokenValidation)(event);
        if (checkAuth !== 1) {
            return (0, responseFormat_1.ResponseFormat)(401, "Unauthorized: Invalid");
        }
        const DB = await (0, AdminController_1.connectToDb)();
        const scoreRangeParam = event.queryStringParameters?.scoreRange;
        const analysisStatusParam = event.queryStringParameters?.status;
        let finalquery = {};
        if (analysisStatusParam === 'ANALYZED') {
            finalquery.score = { $exists: true, $ne: null };
        }
        else if (analysisStatusParam === 'UNANALYZED') {
            finalquery.$or = [{ score: { $exists: false } }, { score: null }];
        }
        if (analysisStatusParam === 'ANALYZED' && scoreRangeParam && scoreRangeParam !== 'ALL') {
            const ranges = scoreRangeParam.split(',');
            const rangeConditions = [];
            ranges.forEach((range) => {
                switch (range) {
                    case '0-30':
                        rangeConditions.push({ score: { $gte: 0, $lte: 30 } });
                        break;
                    case '30-60':
                        rangeConditions.push({ score: { $gt: 30, $lte: 60 } });
                        break;
                    case '60-90':
                        rangeConditions.push({ score: { $gt: 60, $lte: 90 } });
                        break;
                    case 'gt90':
                        rangeConditions.push({ score: { $gt: 90 } });
                        break;
                }
            });
            if (rangeConditions.length > 0) {
                if (finalquery.score && !finalquery.$and) {
                    finalquery.$and = [{ score: finalquery.score }];
                    delete finalquery.score;
                }
                finalquery.$and.push({ $or: rangeConditions });
            }
        }
        console.log("Final MongoDB Query Object:", JSON.stringify(finalquery));
        // --- End of Filtering Logic ---
        const data = await DB.userDb?.find(finalquery).toArray();
        console.log("Data count:", data?.length);
        return (0, responseFormat_1.ResponseFormat)(200, "All filtered data found", data);
    }
    catch (error) {
        console.log("Error", error);
        return (0, responseFormat_1.ResponseFormat)(400, "Something went wrong", error);
    }
};
exports.getFilteredData = getFilteredData;
