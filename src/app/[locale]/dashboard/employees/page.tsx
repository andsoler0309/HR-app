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
    <div className="max-w-[1400px] mx-auto p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-platinum">{t("title")}</h1>
        <div className="flex gap-3">
          <button
            onClick={handleGoToPortal}
            className="btn-secondary flex items-center gap-2 px-5 py-2.5 rounded-lg text-base"
          >
            <ExternalLink className="w-5 h-5" />
            {t("goToPortal")}
          </button>
          <div className="relative group">
            <button
              onClick={handleAddEmployee}
              className={`btn-primary flex items-center gap-2 px-5 py-2.5 rounded-lg text-base ${
                departments.length === 0 
                  ? "opacity-75 cursor-help" 
                  : ""
              }`}
            >
              <Plus className="w-5 h-5" />
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <UpcomingBirthdays employees={employees} />
        <UpcomingAnniversaries employees={employees} />
      </div>

      {successMessage && (
        <Alert variant="success" className="mb-6">
          <CheckCircle2 className="h-4 w-4" />
          <AlertTitle>{t("alerts.documentSuccess.title")}</AlertTitle>
          <AlertDescription>{successMessage}</AlertDescription>
        </Alert>
      )}

      {policies.length === 0 && (
        <Alert variant="infoblack" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("alerts.policyRequired.title")}</AlertTitle>
          <AlertDescription>{t("alerts.policyRequired.message")}</AlertDescription>
        </Alert>
      )}

      {departments.length === 0 && (
        <Alert variant="infoblack" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>{t("alerts.departmentRequired.title")}</AlertTitle>
          <AlertDescription>
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

      <div className="bg-card rounded-xl shadow-md border border-card-border">
        {/* Search and Filter Bar */}
        <div className="p-5 border-b border-card-border bg-card rounded-t-xl flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-sunset" />
            <input
              type="text"
              placeholder={t("search.placeholder")}
              className="input-base pl-11 py-3 text-base"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <select
            className="input-base px-4 py-3 text-base min-w-[200px] w-5"
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
            className="btn-secondary flex items-center gap-2 px-5 py-3 rounded-lg text-base"
          >
            <Download className="w-5 h-5" />
            {t("actions.export")}
          </button>
        </div>

        {/* Table */}
        <div className="overflow-x-auto scrollbar-custom">
          <table className="w-full">
            <thead>
              <tr className="border-b border-card-border">
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.name")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.email")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.position")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.department")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.status")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.type")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.hireDate")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.workingStatus")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.actions")}
                </th>
                <th className="text-sm font-medium text-sunset uppercase tracking-wider text-left px-6 py-5">
                  {t("table.token")}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-card-border">
              {loading ? (
                <tr>
                  <td
                    colSpan={10} // Updated to match the number of columns
                    className="px-6 py-8 text-center text-sunset text-base"
                  >
                    {t("table.loading")}
                  </td>
                </tr>
              ) : filteredEmployees.length === 0 ? (
                <tr>
                  <td
                    colSpan={10} // Updated to match the number of columns
                    className="px-6 py-8 text-center text-sunset text-base"
                  >
                    {t("table.noEmployees")}
                  </td>
                </tr>
              ) : (
                filteredEmployees.map((employee) => (
                  <tr key={employee.id} className="hover:bg-background/50">
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5 text-base text-sunset">
                      {employee.email}
                    </td>
                    <td className="px-6 py-5 text-base text-sunset">
                      {employee.position}
                    </td>
                    <td className="px-6 py-5 text-base text-sunset">
                      {employee.department?.name || t("table.na")}
                    </td>
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5 text-base text-sunset">
                      {new Date(employee.hire_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5">
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
                    <td className="px-6 py-5">
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
