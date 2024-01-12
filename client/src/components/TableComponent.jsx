import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useTable } from 'react-table';
import io from 'socket.io-client';

const TableComponent = () => {
  const [excelSheetData, setExcelSheetData] = useState([]);
  const [pendingChanges, setPendingChanges] = useState({});
  const socketRef = useRef(null);

  useEffect(() => {
    const socket = io('http://192.168.1.101:3000', { path: '/socket.io' });
    socketRef.current = socket;

    socket.on('test-message', (message) => {
      console.log(message);
    });

    socket.on('initialize-data', (excelData) => {
      setExcelSheetData(excelData);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const columns = useMemo(() => {
    return excelSheetData.length > 0
      ? Object.keys(excelSheetData[0]).map((key) => ({ Header: key, accessor: key }))
      : [];
  }, [excelSheetData]);

  const {
    getTableProps,
    getTableBodyProps,
    headerGroups,
    rows,
    prepareRow,
  } = useTable(
    {
      columns,
      data: excelSheetData,
    }
  );

  const handleUpdateData = () => {
    if (socketRef.current) {
      const updatedData = rows.map((row) => ({
        ...row.original,
        ...pendingChanges[row.id], // Apply pending changes
      }));
      console.log('Pending Changes:', pendingChanges);
      console.log('Updated Data:', updatedData);
  
      // Update local state and clear pending changes
      setExcelSheetData(updatedData);
      setPendingChanges({});
  
      // Emit the updated data to the server
      socketRef.current.emit('update-data', updatedData);
    }
  };
  const handleCellChange = (rowId, columnId, value) => {
    // Update pending changes for the specific cell
    setPendingChanges((prevChanges) => ({
      ...prevChanges,
      [rowId]: {
        ...prevChanges[rowId],
        [columnId]: value,
      },
    }));
  };

  return (
    <div>
      <button id="mid" onClick={handleUpdateData}>
        Update Data
      </button>

      <table {...getTableProps()} style={{ marginTop: '10px' }}>
        <thead>
          {headerGroups.map((headerGroup) => (
            <tr {...headerGroup.getHeaderGroupProps()}>
              {headerGroup.headers.map((column) => (
                <th {...column.getHeaderProps()}>{column.render('Header')}</th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {rows.map((row) => {
            prepareRow(row);
            return (
              <tr {...row.getRowProps()}>
                {row.cells.map((cell) => (
                  <td
                  {...cell.getCellProps()}
                  contentEditable
                  suppressContentEditableWarning // suppress React warning
                  key={cell.column.id}
                  onInput={(e) =>
                    handleCellChange(row.id, cell.column.id, e.target.innerText)
                  }
                >
                  {cell.render('Cell')}
                </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
};

export default TableComponent;
