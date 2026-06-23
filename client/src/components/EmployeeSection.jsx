import { useOutletContext } from "react-router-dom";

const EmployeeSection = () => {

  const {
    departments,
    departmentEmployees,
  } = useOutletContext();

  return (
    <div
      className="
      p-10
    "
    >
      <h1
        className="
        text-white
        text-4xl
        font-bold
        mb-10
      "
      >
        Employees Details
      </h1>

      {departments.map(
        (department) => (
          <div
            key={
              department._id
            }
            className="
            mb-10
          "
          >
            <h2
              className="
              text-indigo-400
              text-2xl
              font-bold
              border-b
              border-slate-700
              pb-2
              mb-4
            "
            >
              {
                department.departmentName
              }
            </h2>

            <div
              className="
              grid
              grid-cols-2
              md:grid-cols-3
              lg:grid-cols-4
              gap-4
            "
            >
              {departmentEmployees[
                department._id
              ]?.map(
                (
                  employee
                ) => (
                  <div
                    key={
                      employee._id
                    }
                    className="
                    bg-slate-900
                    border
                    border-slate-800
                    rounded-xl
                    p-4
                  "
                  >
                    <h3
                      className="
                      text-white
                      font-semibold
                    "
                    >
                      {
                        employee.name
                      }
                    </h3>

                    <p
                      className="
                      text-slate-400
                      text-sm
                    "
                    >
                      {
                        employee.empId
                      }
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        )
      )}
    </div>
  );
};

export default EmployeeSection;