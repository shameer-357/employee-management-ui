import { useNavigate } from "react-router-dom"
import "../styles/dashboard.css"

function Sidebar(){

 const navigate = useNavigate()

 const logout = ()=>{
  localStorage.removeItem("token")
  navigate("/")
 }

 return(

  <div className="sidebar">

    <div className="sidebarTitle">
      Portal
    </div>

    <div className="sidebarMenu">

      <div
        className="sidebarItem"
        onClick={()=>navigate("employees")}
      >
        Employees
      </div>

      <div
        className="sidebarItem"
        onClick={()=>navigate("register")}
      >
        Register Employee
      </div>

      <div
        className="sidebarItem"
        onClick={logout}
      >
        Logout
      </div>

    </div>

  </div>

 )

}

export default Sidebar