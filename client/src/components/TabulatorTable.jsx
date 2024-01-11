import React, { useEffect, useRef, useState } from 'react';
import 'tabulator-tables/dist/css/tabulator.min.css';
import { Tabulator } from 'tabulator-tables';
import io from 'socket.io-client';

const TabulatorTable = () => {
  const [excelSheetData, setExcelSheetData] = useState([]);
  const tableRef = useRef(null);

  useEffect(() => {
    const socket = io('http://192.168.1.101:3000', { path: '/socket.io' });

    socket.on('test-message', (message) => {
      console.log(message);
    });

    socket.on('initialize-data', (excelData) => {
      setExcelSheetData(excelData);
      if (tableRef.current) {
        const table = tableRef.current;
        table.setData(excelData);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (tableRef.current) {
      // Destroy the previous instance before creating a new one
      tableRef.current.destroy();
    }
  
    const table = new Tabulator('#example-table', {
      columns: excelSheetData.length > 0
        ? Object.keys(excelSheetData[0]).map((key) => ({ title: key, field: key, editor: 'input' }))
        : [],
      // Remove the autoColumns option
      data: excelSheetData,
      layout: 'fitColumns',
      tooltips: true,
      addRowPos: 'top',
      history: true,
      pagination: 'local',
      paginationSize: 10,
      movableColumns: true,
      resizableRows: true,
      cellEdited: function (cell) {
        // Callback triggered when a cell is edited
        const editedData = cell.getData();
        console.log('Cell edited:', editedData);
      },
    });
  
    // Save the table instance to the ref
    tableRef.current = table;
  
    // Cleanup function to destroy the table when the component unmounts
    return () => {
      table.destroy();
    };
  }, [excelSheetData]);

  const handleUpdateData = () => {
    if (tableRef.current) {
      const updatedData = tableRef.current.getData();
      console.log('Updated Data:', updatedData);

      // Assuming you have an updateData function to update the data on the server
      // updateData(updatedData);

      // Optionally, you can emit an event to notify the server about the updated data
      // socket.emit('update-data', updatedData);
    }
  };

  return (
    <div>
      <button id="mid" onClick={handleUpdateData}>Update Data</button>

      <div id="example-table"></div>
    </div>
  );
};

export default TabulatorTable;