import React, { useState, useEffect } from 'react';
import './App.css';
import SpiralLogo from './spiral_logo.svg';
import BluetoothLogo from './Bluetooth.svg';
import { Button, Navbar, Form } from 'react-bootstrap';
import Plot from 'react-plotly.js';

let bluetoothDevice;
let c = 0;
const spiralService = '6e400001-b5a3-f393-e0a9-e50e24dcca9e';
const spiralRxCharacteristic = '6e400003-b5a3-f393-e0a9-e50e24dcca9e';

function App() {
  const [YawArray, setYawArray] = useState([]);
  const [YawData, setYaw] = useState(0);
  const [RollArray, setRollArray] = useState([]);
  const [RollData, setRoll] = useState(0);
  const [PitchArray, setPitchArray] = useState([]);
  const [PitchData, setPitch] = useState(0);
  const [TempArray, setTempArray] = useState([]);
  const [TempData, setTemp] = useState(0);
  const [isBluetoothOn, setBluetooth] = useState(Boolean);
  const [count, setCount] = useState([]);

  useEffect(() => {
    const timer = setInterval(() => {
      if (isBluetoothOn === true) {
        generateData();
      }
    }, 100); // clearing interval
    return () => clearInterval(timer);
  });

  const connectBLE = async () => {
    try {
      const device = await navigator.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: [spiralService],
      });
      bluetoothDevice = device;
      const server = await device.gatt.connect();
      setBluetooth(true);
      const service = await server.getPrimaryService(spiralService);
      const characteristic = await service.getCharacteristic(
        spiralRxCharacteristic
      );
      characteristic.startNotifications();
      bluetoothDevice.addEventListener(
        'gattserverdisconnected',
        disconnectDevice
      );
      characteristic.addEventListener(
        'characteristicvaluechanged',
        handleCharacteristicValueChanged
      );
    } catch (error) {
      console.log(`There was an error: ${error}`);
    }
  };

  const handleCharacteristicValueChanged = (event) => {
    let value = event.target.value;
    let result = '';
    for (let i = 0; i < value.byteLength; i++) {
      result += String.fromCharCode(value.getUint8(i));
    }

    if (result[0] === "T") {
      let temperature = result.split("T");
      setTemp(parseInt(temperature[1]));
    }
    if (result[0] === "P") {
      let pitch = result.split("P");
      setPitch(parseInt(pitch[1]));
    }
    if (result[0] === "Y") {
      let yaw = result.split("Y");
      setYaw(parseInt(yaw[1]));
    }
    if (result[0] === "R") {
      let roll = result.split("R");
      setRoll(parseInt(roll[1]));
    }
  };

  const disconnectDevice = () => {
    if (bluetoothDevice.gatt.connected) {
      bluetoothDevice.gatt.disconnect();
    }
    setBluetooth(false);
  };

  const generateData = () => {
    for (let i = count.length; i < 10; i++) {
      const tempNum = [...TempArray, TempData];
      const pitchNum = [...PitchArray, PitchData];
      const yawNum = [...YawArray, YawData];
      const rollNum = [...RollArray, RollData];
      const countNum = [...count, c];
      setTempArray(tempNum);
      setPitchArray(pitchNum);
      setYawArray(yawNum);
      setRollArray(rollNum);
      setCount(countNum);
      console.log(rollNum);
    }

    TempArray.shift();
    PitchArray.shift();
    YawArray.shift();
    RollArray.shift();
    count.shift();
    c++;
  };


  if (!isBluetoothOn) {
    return (
      <div className="container">
        <div className="connect-container">
          <img
            src={BluetoothLogo}
            width="60"
            height="60"
            className="d-inline-block align-top"
            alt="Bluetooth logo"
          />
          <div className="spiral-container">
            <h2 className="spiral-header-text">spiral </h2>{' '}
            <img
              id="small-logo"
              src={SpiralLogo}
              width="30"
              height="30"
              className="d-inline-block align-top"
              alt="spiral-logo"
            />{' '}
          </div>
          <div>
            <p className="spiral-intro-text">
              To use this app you need a <br /> spiral board flashed with
              open-tvc.
            </p>
          </div>
          <div className="connect">
            <Button className="connect-button" size="lg" onClick={connectBLE}>
              connect
            </Button>
          </div>
        </div>
      </div>
    );
  } else {
    return (
      <>
        <Navbar bg="dark" variant="dark" className="justify-content-between">
          <Navbar.Brand>
            <img
              alt="spiral-logo"
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
        
   <div className="plot-section">

        <Plot
          data={[
            {
              x: count,
              y: TempArray,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'blue' },
            },
          ]}
          layout={{
            width: 720,
            height: 340,
            title: 'IMU Temperature',
            yaxis: {
              title: {
                text: 'temp in celsius',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
            xaxis: {
              title: {
                text: 'timestep',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
          }}
        />


        <Plot
          data={[
            {
              x: count,
              y: PitchArray,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'yellow' },
            },
          ]}
          layout={{
            width: 720,
            height: 340,
            title: 'IMU Pitch',
            yaxis: {
              title: {
                text: 'pitch',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
            xaxis: {
              title: {
                text: 'timestep',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
          }}
        />
  </div>

 <div className="plot-section">
        <Plot
          data={[
            {
              x: count,
              y: YawArray,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'red' },
            },
          ]}
          layout={{
            width: 720,
            height: 340,
            title: 'IMU Yaw',
            yaxis: {
              title: {
                text: 'yaw',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
            xaxis: {
              title: {
                text: 'timestep',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
          }}
        />
      
        <Plot
          data={[
            {
              x: count,
              y: RollArray,
              type: 'scatter',
              mode: 'lines+markers',
              marker: { color: 'violet' },
            },
          ]}
          layout={{
            width: 720,
            height: 340,
            title: 'IMU Roll',
            yaxis: {
              title: {
                text: 'roll',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
            xaxis: {
              title: {
                text: 'timestep',
                font: {
                  family: 'Courier New, monospace',
                  size: 18,
                  color: '#7f7f7f',
                },
              },
            },
          }}
        />
         
        </div>

      </>
    );
  }
}

export default App;