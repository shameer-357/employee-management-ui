import { useState } from "react"
import API from "../api/api"
import "../styles/dashboard.css"

function RegisterEmployee(){

 const [name,setName] = useState("")
 const [email,setEmail] = useState("")
 const [department,setDepartment] = useState("")

 const registerEmployee = async () => {

  await API.post("/employees",{
   name,
   email,
   department
  })

  setName("")
  setEmail("")
  setDepartment("")

  alert("Employee added successfully")

 }

 return(

  <div className="dashboardContent">

   <div className="card">

    <h2>Add Employee</h2>

    <br/>

    <input
      className="inputField"
      placeholder="Name"
      value={name}
      onChange={(e)=>setName(e.target.value)}
    />

    <input
      className="inputField"
      placeholder="Email"
      value={email}
      onChange={(e)=>setEmail(e.target.value)}
    />

    <input
      className="inputField"
      placeholder="Department"
      value={department}
      onChange={(e)=>setDepartment(e.target.value)}
    />

    <button
      className="primaryButton"
      onClick={registerEmployee}
    >
      Register Employee
    </button>

   </div>

  </div>

 )

}

export default RegisterEmployee