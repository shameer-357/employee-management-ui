import "../styles/login.css";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import API from "../api/api";

function Login(){

 const navigate = useNavigate()

 const [username,setUsername] = useState("")
 const [password,setPassword] = useState("")

 const login = async () => {

  const res = await API.post("/auth/login",{
   username,
   password
  })

  localStorage.setItem("token",res.data)

  navigate("/dashboard")

 }

 return(

  <div className="loginContainer">

   <div className="card loginCard">

    <div className="loginTitle">
      Employee Portal
    </div>

    <div className="loginSubtitle">
      Secure management system
    </div>

    <input
      className="inputField"
      placeholder="Username"
      onChange={(e)=>setUsername(e.target.value)}
    />

    <input
      type="password"
      className="inputField"
      placeholder="Password"
      onChange={(e)=>setPassword(e.target.value)}
    />

    <button
      className="primaryButton"
      onClick={login}
    >
      Sign In
    </button>

   </div>

  </div>

 )

}

export default Login