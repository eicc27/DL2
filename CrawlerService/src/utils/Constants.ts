// User Agent
export const UA = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.1.2 Safari/605.1.15";

export const EXPORT_SERVER = "http://localhost:27001";
// export const N4J_EXPORT_SERVER = "http://localhost:27002";

export const timeout = async (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));