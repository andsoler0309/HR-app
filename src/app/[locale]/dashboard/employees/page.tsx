"use client";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import {
  Plus,
  Search,
  Download,
  AlertCircle,
  Clock,
  CheckCircle2,
  ExternalLink,
  Users,
} from "lucide-react";
import { useRouter, useParams } from "next/navigation";
import EmployeeFormModal from "@/components/employees/EmployeeFormModal";
import { Employee, Department } from "@/types/employee";
import { TimeOffPolicy } from "@/types/timeoff";
import EmployeeDashboard from "@/components/employees/EmployeeDashboard";
import GenerateDocumentModal from "@/components/documents/GenerateDocumentModal";
import SignaturePad from "@/components/documents/SignaturePad";
import { User } from "@supabase/supabase-js";
import EmployeeActions from "@/components/employees/EmployeeActions";
import UpcomingBirthdays from "@/components/employees/UpcomingBirthdays";
import UpcomingAnniversaries from "@/components/employees/UpcomingAnniversaries";
import { Document } from "@/types/document";
import { useTranslations } from "next-intl";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import DepartmentFormModal from "@/components/departments/DepartmentFormModal";

export default function EmployeesPage() {
  const t = useTranslations("employees");
  const router = useRouter();
  const params = useParams();
  const locale = params.locale as string;
  const [employees, setEmployees] = useState<Employee[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [policies, setPolicies] = useState<TimeOffPolicy[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("all");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDepartmentModalOpen, setIsDepartmentModalOpen] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<
    Employee | undefined
  >();
  const [accessTokens, setAccessTokens] = useState<{ [key: string]: string }>(
    {}
  );
  const [isGenerateDocumentModalOpen, setIsGenerateDocumentModalOpen] =
    useState(false);
  const [isSignatureModalOpen, setIsSignatureModalOpen] = useState(false);
  const [selectedDocument, setSelectedDocument] = useState<Document | null>(
    null
  );
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    fetchEmployees();
    fetchDepartments();
    fetchExistingTokens();
    fetchPolicies();
    fetchEmployeesWithAttendance();
  }, []);

  async function fetchDocuments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("documents")
        .select(
          `
          *,
          category:category_id(*),
          employee:employee_id(*)
        `
        )
        .eq("company_id", user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      // Assuming you handle fetched documents elsewhere
    } catch (error) {
      console.error("Error fetching documents:", error);
    }
  }

  async function fetchEmployees() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("employees").select(`
          *,
          department:department_id(id, name)
        `)
        .eq("company_id", user.id);

      if (error) throw error;
      setEmployees(data || []);
    } catch (error) {
      console.log("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchEmployeesWithAttendance() {
    try {
      setLoading(true);

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // First, fetch employees
      const { data: employeesData, error: employeesError } =
        await supabase.from("employees").select(`
          *,
          department:department_id(id, name)
        `)
        .eq("company_id", user.id);

      if (employeesError) throw employeesError;

      // Then, fetch today's attendance records for all employees
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const { data: attendanceData, error: attendanceError } = await supabase
        .from("employee_attendance")
        .select("*")
        .gte("clock_in", today.toISOString())
        .is("clock_out", null)
        .eq("company_id", user.id);

      if (attendanceError) throw attendanceError;

      // Combine the data
      const employeesWithAttendance = employeesData.map((employee) => ({
        ...employee,
        current_attendance:
          attendanceData?.find(
            (record) => record.employee_id === employee.id
          ) || null,
      }));

      setEmployees(employeesWithAttendance);
    } catch (error) {
      console.log("Error fetching employees:", error);
    } finally {
      setLoading(false);
    }
  }

  async function fetchPolicies() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("time_off_policies")
        .select("*")
        .eq("company_id", user.id);

      if (error) throw error;
      setPolicies(data || []);
    } catch (error) {
      console.error("Error fetching policies:", error);
    }
  }

  async function fetchDepartments() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase.from("departments").select("*").eq("company_id", user.id);

      if (error) {
        console.log("Supabase error:", error);
        throw error;
      }

      setDepartments(data || []);
    } catch (error) {
      console.log("Error fetching departments:", error);
    }
  }

  async function fetchExistingTokens() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("employee_portal_access")
        .select("employee_id, access_token")
        .eq("company_id", user.id);

      if (error) throw error;

      const tokens = data.reduce(
        (acc, curr) => ({
          ...acc,
          [curr.employee_id]: curr.access_token,
        }),
        {}
      );

      setAccessTokens(tokens);
    } catch (error) {
      console.error("Error fetching tokens:", error);
    }
  }

  async function generatePortalAccess(employee: Employee) {
    try {
      if (policies.length === 0) {
        alert(t("alerts.policyRequired.message"));
        return;
      }

      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data, error } = await supabase
        .from("employee_portal_access")
        .insert({
          employee_id: employee.id,
          email: employee.email,
          company_id: user.id,
          access_token: Math.random().toString(36).substring(2, 15),
        })
        .select()
        .single();

      if (error) throw error;

      setAccessTokens((prev) => ({
        ...prev,
        [employee.id]: data.access_token,
      }));
    } catch (error) {
      console.error("Error generating access:", error);
    }
  }

  function handleAddEmployee() {
    // Check if there are departments before allowing employee creation
    if (departments.length === 0) {
      setIsDepartmentModalOpen(true);
      return;
    }
    
    setSelectedEmployee(undefined);
    setIsModalOpen(true);
  }

  function handleGoToPortal() {
    router.push(`/${locale}/portal`);
  }

  function handleEditEmployee(employee: Employee) {
    setSelectedEmployee(employee);
    setIsModalOpen(true);
  }

  const handleModalClose = () => {
    setSelectedEmployee(undefined);
    setIsModalOpen(false);
  };

  async function handleExport() {
    // Convert employees data to CSV
    const headers = [
      t("table.name"),
      t("table.email"),
      t("table.position"),
      t("table.department"),
      t("table.status"),
      t("table.hireDate"),
    ];
    const csvData = employees.map((emp) => [
      `${emp.first_name} ${emp.last_name}`,
      emp.email,
      emp.position,
      emp.department?.name || t("table.na"),
      emp.is_active ? t("status.active") : t("status.inactive"),
      new Date(emp.hire_date).toLocaleDateString(),
    ]);

    const csvContent = [
      headers.join(","),
      ...csvData.map((row) => row.join(",")),
    ].join("\n");

    // Create and download file
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", "employees.csv");
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  // Filter employees based on search term and department
  const filteredEmployees = employees.filter((employee) => {
    const matchesSearch =
      employee.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.last_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      employee.email.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesDepartment =
      departmentFilter === "all" ||
      employee.department?.id === departmentFilter;

    return matchesSearch && matchesDepartment;
  });

  return (
    <div className="space-y-6">
      {/* Header Section */}
      <div className="flex flex-col space-y-4 sm:flex-row sm:justify-between sm:items-start sm:space-y-0">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-platinum">{t("title")}</h1>
          <p className="text-sm text-sunset mt-1 sm:hidden">Gestiona tu equipo de trabajo</p>
        </div>
        <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3">
          <button
            onClick={handleGoToPortal}
            className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto"
          >
            <ExternalLink className="w-4 h-4" />
            <span className="sm:hidden">Portal</span>
            <span className="hidden sm:inline">{t("goToPortal")}</span>
          </button>
          <div className="relative group">
            <button
              onClick={handleAddEmployee}
              className={`btn-primary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium w-full sm:w-auto ${
                departments.length === 0 
                  ? "opacity-75 cursor-help" 
                  : ""
              }`}
            >
              <Plus className="w-4 h-4" />
              {t("addEmployee")}
            </button>
            {departments.length === 0 && (
              <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-card text-platinum text-sm rounded-lg shadow-lg border border-card-border opacity-0 group-hover:opacity-100 transition-opacity z-10">
                {t("alerts.departmentRequired.message")}
              </div>
            )}
          </div>
        </div>
      </div>

      <EmployeeDashboard employees={employees} />
      
      {/* Upcoming Events Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <UpcomingBirthdays employees={employees} />
        <UpcomingAnniversaries employees={employees} />
      </div>

      {/* Alerts Section */}
      <div className="space-y-3">
        {successMessage && (
          <Alert variant="success">
            <CheckCircle2 className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">{t("alerts.documentSuccess.title")}</AlertTitle>
            <AlertDescription className="text-sm">{successMessage}</AlertDescription>
          </Alert>
        )}

        {policies.length === 0 && (
          <Alert variant="infoblack">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">{t("alerts.policyRequired.title")}</AlertTitle>
            <AlertDescription className="text-sm">{t("alerts.policyRequired.message")}</AlertDescription>
          </Alert>
        )}

        {departments.length === 0 && (
          <Alert variant="infoblack">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle className="text-sm sm:text-base">{t("alerts.departmentRequired.title")}</AlertTitle>
            <AlertDescription className="text-sm">
              {t("alerts.departmentRequired.message")}{" "}
              <button 
                onClick={() => setIsDepartmentModalOpen(true)}
                className="text-primary hover:text-vanilla underline font-medium"
              >
                {t("alerts.departmentRequired.createNow")}
              </button>
            </AlertDescription>
          </Alert>
        )}
      </div>

      {/* Employees Table/Cards */}
      <div className="bg-card rounded-xl shadow-sm border border-card-border overflow-hidden">
        {/* Search and Filter Bar */}
        <div className="p-4 border-b border-card-border bg-card/50">
          <div className="flex flex-col space-y-3 sm:flex-row sm:space-y-0 sm:space-x-3 sm:items-center">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset w-4 h-4" />
              <input
                type="text"
                placeholder={t("search.placeholder")}
                className="input-base pl-10 py-2.5 text-sm w-full bg-background border-card-border focus:border-primary"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <select
                className="input-base px-3 py-2.5 text-sm bg-background border-card-border focus:border-primary"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">{t("search.allDepartments")}</option>
                {departments.map((dept) => (
                  <option key={dept.id} value={dept.id}>
                    {dept.name}
                  </option>
                ))}
              </select>
              <button
                onClick={handleExport}
                className="btn-secondary flex items-center justify-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium whitespace-nowrap"
              >
                <Download className="w-4 h-4" />
                <span className="hidden sm:inline">{t("actions.export")}</span>
                <span className="sm:hidden">Export</span>
              </button>
            </div>
          </div>
        </div>          {/* Table - Desktop View */}
          <div className="hidden lg:block overflow-x-auto scrollbar-custom">
            <table className="w-full">
              <thead>
                <tr className="border-b border-card-border">
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.name")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.email")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.position")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.department")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.status")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.type")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.hireDate")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.workingStatus")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.actions")}
                  </th>
                  <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-4 py-4">
                    {t("table.token")}
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-card-border">
                {loading ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sunset text-base"
                    >
                      {t("table.loading")}
                    </td>
                  </tr>
                ) : filteredEmployees.length === 0 ? (
                  <tr>
                    <td
                      colSpan={10}
                      className="px-4 py-8 text-center text-sunset text-base"
                    >
                      {t("table.noEmployees")}
                    </td>
                  </tr>
                ) : (
                  filteredEmployees.map((employee) => (
                    <tr key={employee.id} className="hover:bg-background/50">
                      <td className="px-4 py-4">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-base text-primary">
                            {employee.first_name?.[0]?.toUpperCase()}
                            {employee.last_name?.[0]?.toUpperCase()}
                          </div>
                          <span className="ml-3 text-base font-medium text-platinum">
                            {employee.first_name} {employee.last_name}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-4 text-base text-sunset">
                        {employee.email}
                      </td>
                      <td className="px-4 py-4 text-base text-sunset">
                        {employee.position}
                      </td>
                      <td className="px-4 py-4 text-base text-sunset">
                        {employee.department?.name || t("table.na")}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${
                            employee.is_active
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {employee.is_active
                            ? t("status.active")
                            : t("status.inactive")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex px-3 py-1.5 text-sm font-medium rounded-full ${
                            employee.status === "FULL_TIME"
                              ? "bg-success/10 text-success"
                              : employee.status === "PART_TIME"
                              ? "bg-warning/10 text-warning"
                              : "bg-card text-sunset"
                          }`}
                        >
                          {t(
                            `status.${
                              employee.status === "FULL_TIME"
                                ? "fullTime"
                                : "partTime"
                            }`
                          )}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-base text-sunset">
                        {new Date(employee.hire_date).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-4">
                        <span
                          className={`inline-flex items-center gap-2 px-3 py-1.5 text-sm font-medium rounded-full ${
                            employee.current_attendance
                              ? "bg-success/10 text-success"
                              : "bg-card text-sunset"
                          }`}
                        >
                          <Clock className="w-4 h-4" />
                          {employee.current_attendance
                            ? t("status.working")
                            : t("status.notWorking")}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        <EmployeeActions
                          employee={employee}
                          onEdit={handleEditEmployee}
                          onGenerateDocument={(employee: Employee) => {
                            setSelectedEmployee(employee);
                            setSelectedDocument(null);
                            setIsGenerateDocumentModalOpen(true);
                          }}
                          onGenerateAccess={generatePortalAccess}
                          hasTimeOffPolicies={policies.length > 0}
                        />
                      </td>
                      <td className="px-4 py-4">
                        {accessTokens[employee.id] ? (
                          <div>
                            <div className="text-sm text-sunset mb-1">
                              {t("actions.accessToken")}
                            </div>
                            <code className="text-base font-mono text-platinum">
                              {accessTokens[employee.id]}
                            </code>
                          </div>
                        ) : (
                          <div className="relative group">
                            <button
                              onClick={() => generatePortalAccess(employee)}
                              className={`text-xs ${
                                policies.length === 0
                                  ? "text-sunset/50 cursor-not-allowed"
                                  : "text-primary hover:text-vanilla"
                              }`}
                              disabled={policies.length === 0}
                            >
                              {t("actions.generateAccess")}
                            </button>
                            {policies.length === 0 && (
                              <div className="absolute left-0 bottom-full mb-2 w-48 p-3 bg-card text-platinum text-xs rounded-lg shadow-lg border border-card-border opacity-0 group-hover:opacity-100 transition-opacity z-10">
                                {t("alerts.policyRequired.message")}
                              </div>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>          {/* Mobile Card View */}
          <div className="lg:hidden">
            {loading ? (
              <div className="px-4 py-12 text-center text-sunset">
                <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary mb-4"></div>
                <p className="text-sm">{t("table.loading")}</p>
              </div>
            ) : filteredEmployees.length === 0 ? (
              <div className="px-4 py-12 text-center text-sunset">
                <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p className="text-sm">{t("table.noEmployees")}</p>
              </div>
            ) : (
              <div className="divide-y divide-card-border">
                {filteredEmployees.map((employee) => (
                  <div key={employee.id} className="p-4 hover:bg-background/30 transition-colors">
                    {/* Header with avatar and status */}
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center min-w-0 flex-1">
                        <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold flex-shrink-0">
                          {employee.first_name?.[0]?.toUpperCase()}
                          {employee.last_name?.[0]?.toUpperCase()}
                        </div>
                        <div className="ml-3 min-w-0 flex-1">
                          <h3 className="text-base font-semibold text-platinum truncate">
                            {employee.first_name} {employee.last_name}
                          </h3>
                          <p className="text-sm text-sunset truncate">{employee.position}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${
                            employee.current_attendance
                              ? "bg-success/10 text-success"
                              : "bg-card text-sunset"
                          }`}
                        >
                          <Clock className="w-3 h-3" />
                          <span className="hidden xs:inline">
                            {employee.current_attendance ? t("status.working") : t("status.notWorking")}
                          </span>
                        </span>
                      </div>
                    </div>
                    
                    {/* Employee details grid */}
                    <div className="grid grid-cols-2 gap-3 text-sm mb-4">
                      <div className="min-w-0">
                        <span className="text-sunset text-xs block">{t("table.email")}</span>
                        <p className="text-platinum text-sm truncate">{employee.email}</p>
                      </div>
                      <div className="min-w-0">
                        <span className="text-sunset text-xs block">{t("table.department")}</span>
                        <p className="text-platinum text-sm truncate">{employee.department?.name || t("table.na")}</p>
                      </div>
                      <div>
                        <span className="text-sunset text-xs block">{t("table.status")}</span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            employee.is_active
                              ? "bg-success/10 text-success"
                              : "bg-error/10 text-error"
                          }`}
                        >
                          {employee.is_active ? t("status.active") : t("status.inactive")}
                        </span>
                      </div>
                      <div>
                        <span className="text-sunset text-xs block">{t("table.type")}</span>
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-medium rounded-full mt-1 ${
                            employee.status === "FULL_TIME"
                              ? "bg-success/10 text-success"
                              : employee.status === "PART_TIME"
                              ? "bg-warning/10 text-warning"
                              : "bg-card text-sunset"
                          }`}
                        >
                          {t(
                            `status.${
                              employee.status === "FULL_TIME" ? "fullTime" : "partTime"
                            }`
                          )}
                        </span>
                      </div>
                    </div>

                    {/* Footer with date and actions */}
                    <div className="flex items-center justify-between pt-3 border-t border-card-border">
                      <div className="text-xs text-sunset">
                        <span className="block">{t("table.hireDate")}</span>
                        <span className="font-medium">{new Date(employee.hire_date).toLocaleDateString()}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <EmployeeActions
                          employee={employee}
                          onEdit={handleEditEmployee}
                          onGenerateDocument={(employee: Employee) => {
                            setSelectedEmployee(employee);
                            setSelectedDocument(null);
                            setIsGenerateDocumentModalOpen(true);
                          }}
                          onGenerateAccess={generatePortalAccess}
                          hasTimeOffPolicies={policies.length > 0}
                        />
                      </div>
                    </div>
                    
                    {/* Access token section */}
                    {accessTokens[employee.id] && (
                      <div className="mt-3 p-3 bg-background/50 rounded-lg border border-card-border">
                        <div className="text-xs text-sunset mb-2">{t("actions.accessToken")}:</div>
                        <div className="bg-background rounded px-2 py-1 border">
                          <code className="text-xs font-mono text-platinum break-all">
                            {accessTokens[employee.id]}
                          </code>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Modals */}
        <EmployeeFormModal
          isOpen={isModalOpen}
          onClose={handleModalClose}
          employee={selectedEmployee}
          departments={departments}
          onSuccess={fetchEmployees}
        />

        <DepartmentFormModal
          isOpen={isDepartmentModalOpen}
          onClose={() => setIsDepartmentModalOpen(false)}
          onSuccess={() => {
            fetchDepartments();
            setIsDepartmentModalOpen(false);
          }}
        />

        <GenerateDocumentModal
          isOpen={isGenerateDocumentModalOpen}
          onClose={() => {
            setIsGenerateDocumentModalOpen(false);
            setSelectedEmployee(undefined);
            setSelectedDocument(null);
          }}
          employee={selectedEmployee as Employee}
          onSuccess={() => {
            fetchDocuments();
            setIsGenerateDocumentModalOpen(false);
            setSuccessMessage(
              t("alerts.documentSuccess.message")
            );
            setTimeout(() => {
              setSuccessMessage(null);
            }, 10000);
          }}
        />

        <SignaturePad
          isOpen={isSignatureModalOpen}
          onClose={() => {
            setIsSignatureModalOpen(false);
            setSelectedDocument(null);
          }}
          document={selectedDocument as Document}
          onSuccess={() => {
            fetchDocuments();
            setIsSignatureModalOpen(false);
          }}
        />
      </div>
  );
}