import { useEffect, useState } from 'react';
import './App.css'
import io from 'socket.io-client'



const socket = io('http://localhost:3000', {
  path:'/socket.io'
});

function App() {
  const [excelSheetData, setExcelSheetData] = useState([]);


  useEffect(() => {
    socket.on('test-message', (message) => {
      console.log(message);
  });

  socket.on('initialize-data', (excelData) => {
    setExcelSheetData(excelData);
    console.log('data from excel sheet set');
  })

  }, [])
  

  return (
    <div className="App">
    <h1>Real-time Dashboard</h1>
    <table>
        <thead>
            <tr>
                {excelSheetData.length > 0 &&
                    Object.keys(excelSheetData[0]).map((key) => (
                        <th key={key}>{key}</th>
                    ))}
            </tr>
        </thead>
        <tbody>
            {excelSheetData.map((row, index) => (
                <tr key={index}>
                    {Object.values(row).map((value, colIndex) => (
                        <td key={colIndex}>{value}</td>
                    ))}
                </tr>
            ))}
        </tbody>
    </table>
</div>
  )
}

export default App
