import { useState , useEffect} from 'react';
import axios from "axios";
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'

function App() {
  const [count, setCount] = useState(0);
  const [alphabets, setAlphabets] = useState();
  const fetchAPI = async () => {
    const response  = await axios.get('http://localhost:8080/api')
    console.log(response)
    setAlphabets(response.data["1"])
  }


  useEffect(()=>{
    fetchAPI()
  },[])

  return (
    <>
      <h1>{alphabets}</h1>
    </>
  )
}

export default App
