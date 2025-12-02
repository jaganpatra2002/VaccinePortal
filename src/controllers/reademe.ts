import { tokenValidation } from "../middleware/auth";
import { ResponseFormat } from "../utils/responseFormat";
import { connectToDb } from "./AdminController";

export const getFilteredData = async (event: any) => {
    try {
        const checkAuth = await tokenValidation(event);
        if (checkAuth !== 1) {
            return ResponseFormat(401, "Unauthorized: Invalid");
        }
        const DB = await connectToDb();
        const scoreRangeParam = event.queryStringParameters?.scoreRange; 
        const analysisStatusParam = event.queryStringParameters?.status;   
        let finalquery: any = {}; 
        if (analysisStatusParam === 'ANALYZED') {
            finalquery.score = { $exists: true, $ne: null };
        } else if (analysisStatusParam === 'UNANALYZED') {
            finalquery.$or = [{ score: { $exists: false } }, { score: null }];
        }
        if (analysisStatusParam === 'ANALYZED' && scoreRangeParam && scoreRangeParam !== 'ALL') {
            const ranges = scoreRangeParam.split(',');
            const rangeConditions: any[] = [];
            ranges.forEach((range: string) => {
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
        return ResponseFormat(200, "All filtered data found", data);
    } catch (error) {
        console.log("Error", error);
        return ResponseFormat(400, "Something went wrong", error);
    }
}
