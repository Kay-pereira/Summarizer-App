
import './App.css'
import UploadForm from "./Components/forms";
import Footer from './Components/Footer';
import Summaries from './Components/Summaries';
import { Analytics } from "@vercel/analytics/react"

function App() {
  

  return (
    <>
       <div className="App">
        <UploadForm />
        <Footer />
        <Analytics />

      </div>
    </>
  )
}

export default App
