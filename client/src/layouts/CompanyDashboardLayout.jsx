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

      setDepartments(
        departmentRes.data.departments
      );

      const employeesObj = {};

      for (
        let department of departmentRes.data.departments
      ) {
        const empRes =
          await api.get(
            `/employees/department/${department._id}`
          );

        employeesObj[department._id] = empRes.data.employees;
      }

      setDepartmentEmployees(
        employeesObj
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
      }}
    />

    </div>
  );
};

export default CompanyDashboardLayout;