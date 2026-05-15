export const openApiSpec = {
  openapi: "3.0.0",
  info: {
    title: "Hospital API",
    version: "1.0.0"
  },
  paths: {
    "/": {
      get: {
        summary: "Health check",
        responses: {
          "200": {
            description: "OK"
          }
        }
      }
    }
  }
};
