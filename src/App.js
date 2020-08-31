import React, { useState } from 'react';
import './App.css';
import SpiralLogo from "./spiral_logo.svg";
import BluetoothLogo from "./Bluetooth.svg"
import {Button, Navbar, Form} from "react-bootstrap"
import Plot from 'react-plotly.js';

let c = 0;

let bluetoothDevice;
const spiralService = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const spiralRxCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';


function App() {

      const [spiralData, setData] = useState([])
      const [bluetoothOn, setBluetooth] = useState(Boolean) 
      const [mockData, setMockData] = useState([]);
      const [count, setCount] = useState([]);

        const connectBLE = async () => {
          try {
          const device = await navigator.bluetooth.requestDevice({
              acceptAllDevices: true,
              optionalServices: []
          })
          bluetoothDevice = device;
          const server = await device.gatt.connect();
          setBluetooth(true)
          const service = await server.getPrimaryService(spiralService);
          const characteristic = await service.getCharacteristic(spiralRxCharacteristic);
          characteristic.startNotifications()
          bluetoothDevice.addEventListener('gattserverdisconnected', disconnectDevice);
          characteristic.addEventListener('characteristicvaluechanged', handleCharacteristicValueChanged);
        }
          catch(error) {
              console.log(`There was an error: ${error}`);
            }	
        }
  
        const handleCharacteristicValueChanged = (event) => {
  
          let value = event.target.value;
          let result = ''
          for (let i = 0; i < value.byteLength; i++) {
          result += String.fromCharCode(value.getUint8(i));
        }
          console.log(parseInt(result));
          setData(parseInt(result));
       }
  
       const disconnectDevice = () => {

          if(bluetoothDevice.gatt.connected) {
            bluetoothDevice.gatt.disconnect();
          }
          setBluetooth(false);
       }
     
     const generateData = () => {
        for(let i = mockData.length; i < 10; i++) {
          const randomNum = [...mockData, Math.random()]
          const countNum = [...count, c]
          setMockData(randomNum)
          setCount(countNum)
        }
          console.log(count)
          c++;
          count.shift();
          mockData.shift();
     }   

if(!bluetoothOn) {
  return (
    <div className="App">
      <div className="connect-container"> 
      <img
          src={BluetoothLogo}
          width="60"
          height="60"
          className="d-inline-block align-top"
          alt="Bluetooth logo"
        />
        <div className="spiral-container"><h2 className="spiral-header-text">spiral </h2> <img id="small-logo" src={SpiralLogo} width="30" width="30" className="d-inline-block align-top" /> </div>
        <div>
        <p className="spiral-intro-text">To use this app you need a <br/> spiral board flashed with open-tvc.</p>
      </div>
      <div className="connect">
    <Button className="connect-button" size="lg" onClick={connectBLE}>connect</Button>
      </div>
      </div>
</div>

  );

}  
else {
  return(
    <>
    <Navbar bg="dark" variant="dark" className="justify-content-between">
     <Navbar.Brand>
       <img
         alt=""
         src={SpiralLogo}
         width="30"
         height="30"
         className="d-inline-block align-top"
       />{' '}
       Spiral Dashboard
     </Navbar.Brand>
     <Form inline>
     <Button onClick={disconnectDevice}>disconnect</Button> 
     </Form>
     </Navbar>
     
     <Plot
        data={[
          {
            x: count,
            y: mockData,
            type: 'scatter',
            mode: 'lines+markers',
            marker: {color: 'blue'},
          },
        ]}
        layout={ {width: 720, height: 340, title: 'IMU Temperature'} }
      />
      <Button className="mock-data-button" onClick={generateData}> Generate Data</Button>
      </>
       )
}
      
}

export default App;
