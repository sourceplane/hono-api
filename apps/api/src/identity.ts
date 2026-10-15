// The API's identity, written once. GET /health answers with API_NAME, so a
// deploy's smoke and an operator's curl both see which API answered. The Orun
// bootstrap that creates a product rewrites it to that product's name, so keep
// it literal and on one line.
export const API_NAME = "Hono API"
