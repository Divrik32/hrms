import { useEffect, useState } from "react";
import api from "../services/axios";
import EmployeeSection from "../components/EmployeeSection";
import CompanyNavbar from "../shared/CompanyNavbar";
import { Outlet, useParams } from "react-router-dom";

const CompanyDashboardLayout = () => {
  const { companyId } = useParams();
  const [companies, setCompanies] = useState([]);
  const [selectedCompany, setSelectedCompany] = useState(null);

  const [departments, setDepartments] = useState([]);
  const [departmentEmployees, setDepartmentEmployees] = useState({});
  const [withoutDepartmentEmployees, setWithoutDepartmentEmployees] = useState([]);

  useEffect(() => {
    fetchCompanies();
  }, []);
  
  useEffect(() => {
    if (companyId) {
      fetchCompanyById();
    }
  }, [companyId]);

  const fetchCompanies = async () => {
    try {
      const res = await api.get(
        "/companies"
      );
      setCompanies(res.data.companies);

    } catch (error) {
      console.log(error);
    }
  };

  const fetchCompanyById = async () => {
  try {
    const res = await api.get(
      `/companies/${companyId}`
    );

    loadCompanyData(res.data.company);

  } catch (error) {
    console.log(error);
  }
};

const loadCompanyData = async (
  company
) => {
  try {
    setSelectedCompany(company);

    const departmentRes =
      await api.get(
        `/departments/company/${company._id}`
      );

    const companyDepartments =
      Array.isArray(
        departmentRes.data.departments
      )
        ? departmentRes.data.departments
        : [];

    setDepartments(
      companyDepartments
    );

    const employeesObj = {};

    for (
      let department of companyDepartments
    ) {
      const empRes =
        await api.get(
          `/employees/department/${department._id}`
        );

      employeesObj[department._id] =
        Array.isArray(
          empRes.data.employees
        )
          ? empRes.data.employees
          : [];
    }

    setDepartmentEmployees(
      employeesObj
    );

    // Employees whose department
    // does not exist / is not selected
    const withoutDepartmentRes =
      await api.get(
        `/employees/company/${company._id}/without-department`
      );

    setWithoutDepartmentEmployees(
      Array.isArray(
        withoutDepartmentRes.data.employees
      )
        ? withoutDepartmentRes.data.employees
        : []
    );

  } catch (error) {
    console.log(error);
  }
};

  return (
    <div className="min-h-screen bg-slate-950">

      <CompanyNavbar
        companies={companies}
        selectedCompany={selectedCompany}
        onCompanyChange={
          loadCompanyData
        }
      />

      {/* <EmployeeSection
        departments={departments}
        departmentEmployees={
          departmentEmployees
        }
      /> */}

      <Outlet
      context={{
        selectedCompany,
        departments,
        departmentEmployees,
        withoutDepartmentEmployees,
      }}
    />

    </div>
  );
};

export default CompanyDashboardLayout;