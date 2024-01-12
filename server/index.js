const express = require("express");
const app = express();
const http = require("http");
const { Server } = require("socket.io");
const cors = require("cors");
const XLSX = require('xlsx');
const fs = require('fs');
const chokidar = require('chokidar');

app.use(cors());

const server = http.createServer(app);

const io = new Server(server, {
    cors: {
        origin: "http://192.168.1.101:5173",
        methods: ["GET", "POST"],
        transports: ['websocket', 'polling'],
    },
});

const excelFilePath = '../MOCK_DATA.xlsx';

// Function to read Excel data
const readExcelData = () => {
    try {
        const workbook = XLSX.readFile(excelFilePath);
        const sheetName = workbook.SheetNames[0];
        const sheet = workbook.Sheets[sheetName];
        return XLSX.utils.sheet_to_json(sheet, { header: 0 });
    } catch (error) {
        console.log(`Error reading file: ${error}`);
        return [];
    }
};

const writeExcelData = (data) => {
    try {
        const ws = XLSX.utils.json_to_sheet(data);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, 'Sheet1');
        XLSX.writeFile(wb, excelFilePath);
        console.log('Excel file updated successfully.');
    } catch (error) {
        console.log(`Error writing to Excel file: ${error}`);
    }
};

// Read initial Excel data
let excelData = readExcelData();
io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);
    socket.emit('test-message', 'Hello from the server!');
    socket.emit('initialize-data', excelData);

    // Watch for changes in the Excel file using chokidar
    const watcher = chokidar.watch(excelFilePath);
    watcher.on('change', () => {
        console.log('Excel file changed, reloading data...');
        excelData = readExcelData();
        // Emit the updated data to all connected clients
        io.emit('initialize-data', excelData);
    });

    // Updating data from react
    socket.on('update-data', (updatedData) => {
        // Update the Excel file with the new data
        writeExcelData(updatedData);

        // Broadcast the updated data to all connected clients
        io.emit('initialize-data', updatedData);
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${socket.id}`);
    });
});

process.on('SIGINT', () => {
    watcher.close();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

server.listen(3000, () => {
    console.log('Server is running on port : 3000');
});
