import Sidebar from "../components/Sidebar"
import Header from "../components/Header"
import Footer from "../components/Footer"
import { Outlet } from "react-router-dom"
import "../styles/dashboard.css"

function DashboardLayout(){

 return(

  <div className="dashboardLayout">

    <Sidebar/>

    <div className="mainSection">

      <Header/>

      <div className="contentArea">

        <Outlet/>

      </div>

      <Footer/>

    </div>

  </div>

 )

}

export default DashboardLayout