import { useEffect,useState } from "react"
import API from "../api/api"
import "../styles/dashboard.css"
import { jwtDecode } from "jwt-decode"


interface Employee{
 id:number
 name:string
 email:string
 department:string
}

function Employees(){

 const [employees,setEmployees] = useState<Employee[]>([])

 const [editId,setEditId] = useState<number | null>(null)

 const [deleteId,setDeleteId] = useState<number | null>(null)

const [editEmployee,setEditEmployee] = useState({
 name:"",
 email:"",
 department:""
})

const startEdit = (emp:Employee) => {

 setEditId(emp.id)

 setEditEmployee({
  name:emp.name,
  email:emp.email,
  department:emp.department
 })

}

 const loadEmployees = async ()=>{

  const res = await API.get("/employees")

  setEmployees(res.data)

 }

const saveEmployee = async (id:number)=>{

 await API.put(`/employees/${id}`,editEmployee)

 setEditId(null)

 loadEmployees()

}


 useEffect(()=>{
  loadEmployees()
 },[])

 const confirmDelete = async () => {

 await API.delete(`/employees/${deleteId}`)

 setDeleteId(null)

 loadEmployees()

}

 const deleteEmployee = async(id:number)=>{

 const confirmDelete = window.confirm(
  "Are you sure you want to delete this employee?"
 )

 if(!confirmDelete) return

 await API.delete(`/employees/${id}`)

 loadEmployees()

}

const token = localStorage.getItem("token")

let role = ""

if(token){
 const decoded:any = jwtDecode(token)
 role = decoded.role
}

 return(

  <div className="card">

   <h2>Employees</h2>

   <br/>

   <table className="employeeTable">

    <thead>

     <tr>
      <th>Name</th>
      <th>Email</th>
      <th>Department</th>
      <th>Action</th>
     </tr>

    </thead>

    <tbody>

{employees.map(emp =>(

<tr key={emp.id}>

<td>

{editId === emp.id ?

<input
 value={editEmployee.name}
 onChange={(e)=>
  setEditEmployee({...editEmployee,name:e.target.value})
 }
/>

:

emp.name

}

</td>

<td>

{editId === emp.id ?

<input
 value={editEmployee.email}
 onChange={(e)=>
  setEditEmployee({...editEmployee,email:e.target.value})
 }
/>

:

emp.email

}

</td>

<td>

{editId === emp.id ?

<input
 value={editEmployee.department}
 onChange={(e)=>
  setEditEmployee({...editEmployee,department:e.target.value})
 }
/>

:

emp.department

}

</td>

<td>

{/* EDIT BUTTON */}

{role === "ADMIN" && (

 editId === emp.id ?

 <button
  className="primaryButton"
  onClick={()=>saveEmployee(emp.id)}
 >
  Save
 </button>

 :

 <button
  className="primaryButton"
  onClick={()=>startEdit(emp)}
 >
  Edit
 </button>

)}

{/* DELETE BUTTON */}

{role === "ADMIN" && (

<button
 className="deleteButton"
 onClick={()=>setDeleteId(emp.id)}
>
 Delete
</button>

)}

</td>

</tr>

))}

</tbody>

   </table>

  </div>

 )

}

export default Employees