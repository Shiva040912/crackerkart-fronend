import { useEffect, useMemo, useState } from "react";
import {
  FiEdit2,
  FiEye,
  FiEyeOff,
  FiSearch,
  FiTrash2,
  FiUserCheck,
  FiUserPlus,
  FiUsers,
  FiX,
} from "react-icons/fi";
import toast from "react-hot-toast";

import api from "../../api/axios";
import AdminSidebar from "../../components/AdminSidebar";

import "../../styles/admincommon.css";
import "../../styles/employees.css";

const initialForm = {
  name: "",
  age: "",
  phone: "",
  email: "",
  password: "",
  department: "",
};

const departmentLabels = {
  super_admin: "Super Admin",
  admin: "Admin Department",
  inventory: "Inventory Department",
  orders: "Orders Department",
  customer_support: "Customer Support",
};

const Employees = () => {
  const adminUser = JSON.parse(localStorage.getItem("adminUser") || "{}");

  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(initialForm);

  const [editingId, setEditingId] = useState(null);
  const [showForm, setShowForm] = useState(false);

  const [search, setSearch] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");

  const [showPassword, setShowPassword] = useState(false);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const loadEmployees = async () => {
    try {
      setLoading(true);

      const response = await api.get("/employees");

      setEmployees(
        Array.isArray(response.data?.employees) ? response.data.employees : [],
      );
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to load employees");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadEmployees();
  }, []);

  const filteredEmployees = useMemo(() => {
    const query = search.trim().toLowerCase();

    return employees.filter((employee) => {
      const matchesSearch =
        !query ||
        employee.name?.toLowerCase().includes(query) ||
        employee.email?.toLowerCase().includes(query) ||
        employee.phone?.includes(query) ||
        employee.department?.toLowerCase().includes(query);

      const matchesDepartment =
        departmentFilter === "all" || employee.department === departmentFilter;

      return matchesSearch && matchesDepartment;
    });
  }, [employees, search, departmentFilter]);

  const activeEmployees = employees.filter(
    (employee) => employee.isActive,
  ).length;

  const inactiveEmployees = employees.length - activeEmployees;

  const handleChange = (event) => {
    const { name, value } = event.target;

    setForm((previousForm) => ({
      ...previousForm,
      [name]: value,
    }));
  };

  const resetForm = () => {
    setForm(initialForm);
    setEditingId(null);
    setShowPassword(false);
    setShowForm(false);
  };
  const validateForm = () => {
    if (!form.name.trim()) {
      toast.error("Staff name is required");
      return false;
    }

    const age = Number(form.age);

    if (!Number.isInteger(age) || age < 18 || age > 65) {
      toast.error("Age must be between 18 and 65");
      return false;
    }

    if (!/^[6-9]\d{9}$/.test(form.phone.trim())) {
      toast.error("Enter a valid 10 digit phone number");
      return false;
    }

    if (!form.department) {
      toast.error("Department is required");
      return false;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      toast.error("Enter a valid email address");
      return false;
    }

    if (!editingId && form.password.length < 8) {
      toast.error("Password must contain at least 8 characters");
      return false;
    }

    return true;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    const employeeData = {
      name: form.name.trim(),
      age: Number(form.age),
      phone: form.phone.trim(),
      email: form.email.trim().toLowerCase(),
      department: form.department,
    };

    try {
      setSaving(true);

      if (editingId) {
        await api.patch(`/employees/${editingId}`, employeeData);

        toast.success("Employee updated successfully");
      } else {
        await api.post("/employees", {
          ...employeeData,
          password: form.password,
        });

        toast.success("Employee created successfully");
      }

      resetForm();
      setShowForm(false);
      await loadEmployees();
    } catch (error) {
      const message = error.response?.data?.message;

      toast.error(
        Array.isArray(message)
          ? message[0]
          : message || "Employee action failed",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleEdit = (employee) => {
    setEditingId(employee._id);

    setForm({
      name: employee.name || "",
      age: employee.age || "",
      phone: employee.phone || "",
      email: employee.email || "",
      password: "",
      department: employee.department || "",
    });

    setShowPassword(false);
    setShowForm(true);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  const handleStatusToggle = async (employee) => {
    try {
      await api.patch(`/employees/${employee._id}`, {
        isActive: !employee.isActive,
      });

      toast.success(
        employee.isActive ? "Employee deactivated" : "Employee activated",
      );

      await loadEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Status update failed");
    }
  };

  const handleDelete = async (employee) => {
    const confirmed = window.confirm(`Delete ${employee.name} permanently?`);

    if (!confirmed) return;

    try {
      await api.delete(`/employees/${employee._id}`);

      toast.success("Employee deleted successfully");

      if (editingId === employee._id) {
        resetForm();
      }

      await loadEmployees();
    } catch (error) {
      toast.error(error.response?.data?.message || "Employee delete failed");
    }
  };

  return (
    <div className="admin-layout">
      <AdminSidebar />

      <main className="admin-content">
        <header className="admin-topbar">
          <div>
            <h1>Employee Management</h1>

            <p>Create and manage department staff accounts.</p>
          </div>

          <div className="employee-header-actions">
            <button
              type="button"
              className="employee-create-btn"
              onClick={() => {
                resetForm();
                setShowForm(true);
              }}
            >
              <FiUserPlus />
              Create Employee
            </button>

            <div className="admin-user-chip">
              <span className="admin-user-avatar">
                {(adminUser?.name || "S").charAt(0).toUpperCase()}
              </span>

              <div>
                <strong>{adminUser?.name || "Super Admin"}</strong>

                <small>Super Administrator</small>
              </div>
            </div>
          </div>
        </header>
        <section className="employee-summary-grid">
          <article className="employee-summary-card">
            <span className="employee-summary-icon">
              <FiUsers />
            </span>

            <div>
              <p>Total Employees</p>
              <strong>{employees.length}</strong>
            </div>
          </article>

          <article className="employee-summary-card">
            <span className="employee-summary-icon active">
              <FiUserCheck />
            </span>

            <div>
              <p>Active Employees</p>
              <strong>{activeEmployees}</strong>
            </div>
          </article>

          <article className="employee-summary-card">
            <span className="employee-summary-icon inactive">
              <FiUsers />
            </span>

            <div>
              <p>Inactive Employees</p>
              <strong>{inactiveEmployees}</strong>
            </div>
          </article>
        </section>

        {showForm && (
          <section className="employee-form-panel">
            <div className="employee-panel-heading">
              <div>
                <h2>{editingId ? "Edit Employee" : "Create Employee"}</h2>

                <p>Enter staff details and assign a department.</p>
              </div>

              <button
                type="button"
                className="employee-cancel-btn"
                onClick={resetForm}
              >
                <FiX />
                {editingId ? "Cancel Edit" : "Close"}
              </button>
            </div>

            <form className="employee-form" onSubmit={handleSubmit}>
              <div className="employee-form-group">
                <label>Staff Name</label>

                <input
                  type="text"
                  name="name"
                  placeholder="Enter staff name"
                  value={form.name}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label>Age</label>

                <input
                  type="number"
                  name="age"
                  min="18"
                  max="65"
                  placeholder="Enter age"
                  value={form.age}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label>Contact Number</label>

                <input
                  type="tel"
                  name="phone"
                  maxLength="10"
                  placeholder="Enter 10 digit number"
                  value={form.phone}
                  onChange={handleChange}
                />
              </div>

              <div className="employee-form-group">
                <label>Department</label>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                >
                  <option value="">Select Department</option>

                  <option value="admin">Admin Department</option>

                  <option value="inventory">Inventory Department</option>

                  <option value="orders">Orders Department</option>

                  <option value="customer_support">Customer Support</option>
                </select>
              </div>

              <div className="employee-form-group">
                <label>Email Address</label>

                <input
                  type="email"
                  name="email"
                  placeholder="Enter staff email"
                  value={form.email}
                  onChange={handleChange}
                  autoComplete="off"
                />
              </div>

              {!editingId && (
                <div className="employee-form-group">
                  <label>Password</label>

                  <div className="employee-password-box">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      placeholder="Minimum 8 characters"
                      value={form.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                    />

                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <FiEyeOff /> : <FiEye />}
                    </button>
                  </div>
                </div>
              )}

              <button
                type="submit"
                className="employee-save-btn"
                disabled={saving}
              >
                <FiUserPlus />

                {saving
                  ? "Saving..."
                  : editingId
                    ? "Update Employee"
                    : "Create Employee"}
              </button>
            </form>
          </section>
        )}
        <section className="employee-list-panel">
          <div className="employee-list-header">
            <div>
              <h2>All Employees</h2>

              <p>{filteredEmployees.length} employees shown</p>
            </div>

            <div className="employee-filters">
              <div className="employee-search-box">
                <FiSearch />

                <input
                  type="text"
                  placeholder="Search employees..."
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                />
              </div>

              <select
                value={departmentFilter}
                onChange={(event) => setDepartmentFilter(event.target.value)}
              >
                <option value="all">All Departments</option>

                <option value="admin">Admin</option>

                <option value="inventory">Inventory</option>

                <option value="orders">Orders</option>

                <option value="customer_support">Customer Support</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="employee-empty-state">Loading employees...</div>
          ) : filteredEmployees.length === 0 ? (
            <div className="employee-empty-state">No employees found</div>
          ) : (
            <div className="employee-table-wrapper">
              <table className="employee-table">
                <thead>
                  <tr>
                    <th>Staff Name</th>
                    <th>Age</th>
                    <th>Department</th>
                    <th>Email Address</th>
                    <th>Contact</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredEmployees.map((employee) => (
                    <tr key={employee._id}>
                      <td>
                        <div className="employee-name-cell">
                          <span>
                            {(employee.name || "E").charAt(0).toUpperCase()}
                          </span>

                          <strong>{employee.name}</strong>
                        </div>
                      </td>

                      <td>{employee.age}</td>

                      <td>
                        <span className="employee-department-badge">
                          {departmentLabels[employee.department] ||
                            employee.department}
                        </span>
                      </td>

                      <td>{employee.email}</td>

                      <td>{employee.phone}</td>

                      <td>
                        <button
                          type="button"
                          className={`employee-status-btn ${
                            employee.isActive ? "active" : "inactive"
                          }`}
                          onClick={() => handleStatusToggle(employee)}
                        >
                          {employee.isActive ? "Active" : "Inactive"}
                        </button>
                      </td>

                      <td>
                        <div className="employee-actions">
                          <button
                            type="button"
                            className="employee-edit-btn"
                            onClick={() => handleEdit(employee)}
                          >
                            <FiEdit2 />
                            Edit
                          </button>

                          <button
                            type="button"
                            className="employee-delete-btn"
                            onClick={() => handleDelete(employee)}
                          >
                            <FiTrash2 />
                            Delete
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Employees;
