const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const XLSX = require('xlsx');
const fs = require('fs');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
    },
})

// Function to read Excel data
const readExcelData = () => {
    try {
        const workbook = XLSX.readFile('../MOCK_DATA.xlsx');
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, { header: 1 });
    } catch (error) {
        console.log(`Error reading file: ${error}`);
        return [];
    }
};

// Read initial Excel data
excelData = readExcelData();
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('test-message', 'Hello from the server!');
    socket.emit('initialize-data', excelData);

    // Watch for changes in the Excel file
    fs.watchFile('../MOCK_DATA.xlsx', (curr, prev) => {
        console.log('Excel file changed, reloading data...');
        excelData = readExcelData();
        // Emit the updated data to all connected clients
        io.emit('initialize-data', excelData);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

process.on('SIGINT', () => {
    fileWatcher.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port : 3000');
})
