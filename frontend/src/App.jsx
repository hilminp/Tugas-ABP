import { useEffect, useState } from 'react'

function App() {
  const [data, setData] = useState("loading...")

  useEffect(() => {
    fetch('http://localhost:8000/test')
      .then(res => res.json())
      .then(data => setData(data))
      .catch(err => {
        console.error(err)
        setData("ERROR FETCH")
      })
  }, [])

  return (
    <div>
      <h1>Frontend React 🔥</h1>
      <pre>{JSON.stringify(data, null, 2)}</pre>
    </div>
  )
}

export default App