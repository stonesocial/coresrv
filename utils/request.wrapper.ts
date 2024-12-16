import { HttpException, Logger } from "@nestjs/common";
import { ResponseModel } from "../response.model.js";

const logger = new Logger('GlobalContext');

export async function requestWrapper(
    callback: () => any, 
    onError?: (error: any) => any,
) : Promise<any> {
    try {
        return await callback();
    } catch (error) {
        if (onError) return onError(error);

        if (error instanceof HttpException) {
            logger.log(error.stack);

            return new ResponseModel({
                statusCode: error.getStatus(),
                message: error.message,
            });
        }

        logger.log((error as Error).stack);

        return new ResponseModel({
            statusCode: 0,
            message: error.toString(),
        });
    }
}