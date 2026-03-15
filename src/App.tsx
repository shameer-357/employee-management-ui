import { BrowserRouter,Routes,Route } from "react-router-dom"
import Login from "./pages/Login"
import Employees from "./pages/Employees"
import RegisterEmployee from "./pages/RegisterEmployee"
import DashboardLayout from "./layouts/DashboardLayout"

function App(){

 return(

  <BrowserRouter>

   <Routes>

    <Route path="/" element={<Login/>} />

    <Route path="/dashboard" element={<DashboardLayout/>}>

      <Route path="employees" element={<Employees/>} />

      <Route path="register" element={<RegisterEmployee/>} />

    </Route>

   </Routes>

  </BrowserRouter>

 )

}

export default App