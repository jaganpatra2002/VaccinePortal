export const ResponseFormat=(code:any, message:any, logs?:any) => {
    return {
        statusCode: code,
        body: JSON.stringify({
            message: message,
            logs:logs
        })
    }
}     