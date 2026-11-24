import { useEffect, useState, useCallback } from "react";
import axios from "axios";
import API from "../api/api";
import { getUserRole } from "../utils/auth";
import "../styles/dashboard.css";

interface Employee {
  id: number;
  name: string;
  email: string;
  department: string;
}

interface SpringPage<T> {
  content: T[];
  totalPages: number;
  totalElements: number;
  number: number;
  size: number;
  first: boolean;
  last: boolean;
}

interface ApiErrorData {
  message?: string;
  error?: string;
  errors?: Record<string, string>;
}

function Employees() {
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Pagination state (0-indexed for Spring Data)
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const pageSize = 5;

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Edit state
  const [editId, setEditId] = useState<number | null>(null);
  const [editEmployee, setEditEmployee] = useState({
    name: "",
    email: "",
    department: "",
  });
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const role = getUserRole();
  const isAdmin = role === "ADMIN";

  const loadEmployees = useCallback(
    async (pageToLoad: number) => {
      try {
        setLoading(true);
        setErrorMessage(null);
        const res = await API.get<SpringPage<Employee>>(
          `/employees/page?page=${pageToLoad}&size=${pageSize}`
        );

        const pageData = res.data;
        if (pageData && Array.isArray(pageData.content)) {
          setEmployees(pageData.content);
          setTotalPages(pageData.totalPages || 1);
          setTotalElements(pageData.totalElements || 0);
        } else if (Array.isArray(pageData)) {
          setEmployees(pageData);
          setTotalPages(1);
          setTotalElements((pageData as Employee[]).length);
        } else {
          setEmployees([]);
          setTotalPages(1);
          setTotalElements(0);
        }
      } catch (err: unknown) {
        let msg = "Failed to load employees.";
        if (axios.isAxiosError<ApiErrorData>(err)) {
          msg = err.response?.data?.message || err.response?.data?.error || msg;
        }
        setErrorMessage(msg);
      } finally {
        setLoading(false);
      }
    },
    [pageSize]
  );

  useEffect(() => {
    loadEmployees(page);
  }, [loadEmployees, page]);

  const startEdit = (emp: Employee) => {
    setEditId(emp.id);
    setEditEmployee({
      name: emp.name,
      email: emp.email,
      department: emp.department,
    });
    setErrorMessage(null);
    setSuccessMessage(null);
  };

  const cancelEdit = () => {
    setEditId(null);
    setEditEmployee({ name: "", email: "", department: "" });
  };

  const saveEmployee = async (id: number) => {
    setErrorMessage(null);
    setSuccessMessage(null);

    const trimmedName = editEmployee.name.trim();
    const trimmedEmail = editEmployee.email.trim();
    const trimmedDept = editEmployee.department.trim();

    if (!trimmedName) {
      setErrorMessage("Employee name cannot be blank.");
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMessage("Please enter a valid email address.");
      return;
    }

    if (!trimmedDept) {
      setErrorMessage("Department cannot be blank.");
      return;
    }

    try {
      setIsSaving(true);
      await API.put(`/employees/${id}`, {
        name: trimmedName,
        email: trimmedEmail,
        department: trimmedDept,
      });

      setSuccessMessage("Employee updated successfully.");
      setEditId(null);
      await loadEmployees(page);
    } catch (err: unknown) {
      let msg = "Failed to update employee.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        msg = err.response?.data?.message || err.response?.data?.error || msg;
      }
      setErrorMessage(msg);
    } finally {
      setIsSaving(false);
    }
  };

  // Wired to confirmDelete (DELETE /employees/{id})
  const confirmDelete = async () => {
    if (!deleteTarget) return;

    try {
      setIsDeleting(true);
      setErrorMessage(null);
      await API.delete(`/employees/${deleteTarget.id}`);

      setSuccessMessage(`Employee "${deleteTarget.name}" deleted successfully.`);
      setDeleteTarget(null);

      // If last item on current page (and not first page), go back one page
      if (employees.length === 1 && page > 0) {
        setPage((prev) => prev - 1);
      } else {
        await loadEmployees(page);
      }
    } catch (err: unknown) {
      let msg = "Failed to delete employee.";
      if (axios.isAxiosError<ApiErrorData>(err)) {
        msg = err.response?.data?.message || err.response?.data?.error || msg;
      }
      setErrorMessage(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filter employees based on search term (name, email, or department)
  const filteredEmployees = employees.filter((emp) => {
    const q = searchTerm.toLowerCase().trim();
    if (!q) return true;
    return (
      (emp.name && emp.name.toLowerCase().includes(q)) ||
      (emp.email && emp.email.toLowerCase().includes(q)) ||
      (emp.department && emp.department.toLowerCase().includes(q))
    );
  });

  return (
    <div className="card">
      <div className="dashboardHeader">
        <div>
          <h2>Employees</h2>
          <p className="cardSubtitle">Manage organization members and staff</p>
        </div>

        <input
          type="text"
          className="searchBar"
          placeholder="Search by name, email, department..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      {successMessage && (
        <div className="alert alertSuccess">{successMessage}</div>
      )}

      {errorMessage && <div className="alert alertError">{errorMessage}</div>}

      <div className="tableResponsive">
        <table className="employeeTable">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Department</th>
              {isAdmin && <th>Action</th>}
            </tr>
          </thead>

          <tbody>
            {loading && employees.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: "center", padding: "30px" }}>
                  Loading employees...
                </td>
              </tr>
            ) : filteredEmployees.length === 0 ? (
              <tr>
                <td colSpan={isAdmin ? 4 : 3} style={{ textAlign: "center", padding: "30px", opacity: 0.7 }}>
                  {searchTerm ? "No employees match your search." : "No employees found."}
                </td>
              </tr>
            ) : (
              filteredEmployees.map((emp) => (
                <tr key={emp.id}>
                  <td>
                    {editId === emp.id ? (
                      <input
                        className="inputField"
                        style={{ marginBottom: 0 }}
                        value={editEmployee.name}
                        onChange={(e) =>
                          setEditEmployee({ ...editEmployee, name: e.target.value })
                        }
                      />
                    ) : (
                      emp.name
                    )}
                  </td>

                  <td>
                    {editId === emp.id ? (
                      <input
                        type="email"
                        className="inputField"
                        style={{ marginBottom: 0 }}
                        value={editEmployee.email}
                        onChange={(e) =>
                          setEditEmployee({ ...editEmployee, email: e.target.value })
                        }
                      />
                    ) : (
                      emp.email
                    )}
                  </td>

                  <td>
                    {editId === emp.id ? (
                      <input
                        className="inputField"
                        style={{ marginBottom: 0 }}
                        value={editEmployee.department}
                        onChange={(e) =>
                          setEditEmployee({ ...editEmployee, department: e.target.value })
                        }
                      />
                    ) : (
                      emp.department
                    )}
                  </td>

                  {/* EDIT AND DELETE BUTTONS - ONLY VISIBLE TO ADMIN */}
                  {isAdmin && (
                    <td>
                      <div className="actionCell">
                        {editId === emp.id ? (
                          <>
                            <button
                              className="primaryButton"
                              style={{ padding: "6px 14px", fontSize: "13px" }}
                              onClick={() => saveEmployee(emp.id)}
                              disabled={isSaving}
                            >
                              {isSaving ? "Saving..." : "Save"}
                            </button>
                            <button
                              className="secondaryButton"
                              style={{ padding: "6px 12px", fontSize: "13px" }}
                              onClick={cancelEdit}
                              disabled={isSaving}
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              className="primaryButton"
                              style={{ padding: "6px 14px", fontSize: "13px" }}
                              onClick={() => startEdit(emp)}
                            >
                              Edit
                            </button>
                            <button
                              className="deleteButton"
                              onClick={() => setDeleteTarget(emp)}
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* PAGINATION CONTROLS */}
      <div className="paginationControls">
        <button
          className="pageButton"
          onClick={() => setPage((prev) => Math.max(0, prev - 1))}
          disabled={page <= 0 || loading}
        >
          Previous
        </button>

        <span className="pageInfo">
          Page {totalPages > 0 ? page + 1 : 0} of {totalPages || 1} ({totalElements} total)
        </span>

        <button
          className="pageButton"
          onClick={() => setPage((prev) => Math.min(totalPages - 1, prev + 1))}
          disabled={page >= totalPages - 1 || loading || totalPages === 0}
        >
          Next
        </button>
      </div>

      {/* CONFIRM DELETE MODAL */}
      {deleteTarget && (
        <div className="modalOverlay" onClick={() => !isDeleting && setDeleteTarget(null)}>
          <div className="modalContent" onClick={(e) => e.stopPropagation()}>
            <h3 className="modalTitle">Confirm Deletion</h3>
            <p className="modalBody">
              Are you sure you want to delete employee <strong>"{deleteTarget.name}"</strong> ({deleteTarget.email})? This action cannot be undone.
            </p>
            <div className="modalActions">
              <button
                className="secondaryButton"
                onClick={() => setDeleteTarget(null)}
                disabled={isDeleting}
              >
                Cancel
              </button>
              <button
                className="deleteButton"
                onClick={confirmDelete}
                disabled={isDeleting}
              >
                {isDeleting ? "Deleting..." : "Delete Employee"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Employees;
