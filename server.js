const http = require('http');
const app = require("./app")
const server = http.createServer(app);

const PORT = process.env.PORT || 7000
server.listen(PORT, console.log("Expense Tracker  is Running on  http://localhost:7000/"))


