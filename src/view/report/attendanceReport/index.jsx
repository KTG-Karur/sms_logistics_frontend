import { useState, useEffect, useMemo } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../redux/themeStore/themeConfigSlice';
import { showMessage, dateConversion } from '../../../util/AllFunction';
import { getEmployee } from '../../../redux/employeeSlice';
import { getStaffAttendanceList, getStaffAttendance, getStaffAttendanceReport } from '../../../redux/attendanceSlice';
import { getHoliday, createHoliday, resetHolidayStatus, deleteHoliday } from '../../../redux/holidaySlice';
import moment from 'moment';
import * as XLSX from 'xlsx';
import IconCalendar from '../../../components/Icon/IconCalendar';
import IconUser from '../../../components/Icon/IconUser';
import IconCheckCircle from '../../../components/Icon/IconCheckCircle';
import IconXCircle from '../../../components/Icon/IconXCircle';
import IconSun from '../../../components/Icon/IconSun';
import IconMoodSmile from '../../../components/Icon/IconMoodSmile';
import IconSearch from '../../../components/Icon/IconSearch';
import IconPlus from '../../../components/Icon/IconPlus';
import IconTrashLines from '../../../components/Icon/IconTrashLines';
import IconDownload from '../../../components/Icon/IconDownload';
import IconFilter from '../../../components/Icon/IconCoffee';
import IconClock from '../../../components/Icon/IconClock';
import IconUsers from '../../../components/Icon/IconUsers';
import IconChartBar from '../../../components/Icon/IconChartBar';
import IconEye from '../../../components/Icon/IconEye';
import IconPrinter from '../../../components/Icon/IconPrinter';
import IconFileText from '../../../components/Icon/IconTxtFile';
import noProfile from '../../../../public/assets/images/no-profile.jpg';
import { baseURL } from '../../../api/ApiConfig';

const AttendanceReport = () => {
  const dispatch = useDispatch();

  // Redux state
  const { employeeData, loading: employeeLoading } = useSelector((state) => state.EmployeeSlice);
  const { monthlyAttendance, attendanceReport, dailyAttendance, loading: attendanceLoading } = useSelector((state) => state.AttendanceSlice);
  const { holidayData, createHolidaySuccess, loading: holidayLoading } = useSelector((state) => state.HolidaySlice);

  // Login info
  const loginInfo = localStorage.getItem('loginInfo');
  const localData = loginInfo ? JSON.parse(loginInfo) : null;
  const branchIdforRole = localData?.branchId || null;
  const roleIdforRole = localData?.roleId || null;
  const currentUserId = localData?.employeeId || null;

  // Default month - current month
  const defaultMonth = moment().format('YYYY-MM');

  // States
  const [loading, setLoading] = useState(true);
  const [state, setState] = useState({
    month: defaultMonth,
    branchId: branchIdforRole,
    departmentId: null
  });

  const [optionListState, setOptionListState] = useState({
    departmentList: [{ departmentId: null, departmentName: "All" }],
    branchList: [{ branchId: null, branchName: "All" }],
    employeeList: []
  });

  const [attendanceData, setAttendanceData] = useState({
    attendanceDetail: [],
    monthCount: {},
    perDayAbsent: {},
    perDayPresent: {}
  });

  const [holidays, setHolidays] = useState([]);
  const [showHolidayForm, setShowHolidayForm] = useState(false);
  const [showHolidayList, setShowHolidayList] = useState(false);
  const [holidayForm, setHolidayForm] = useState({
    reason: '',
    holiday_date: moment().format('YYYY-MM-DD'),
    is_active: 1,
    created_by: currentUserId
  });

  // ============= INITIAL LOAD =============
  useEffect(() => {
    dispatch(setPageTitle('Attendance Report'));
    fetchEmployees();
    fetchHolidays();
  }, []);

  // Fetch attendance when month/filters change
  useEffect(() => {
    if (state.month) {
      fetchAttendanceData();
    }
  }, [state.month, state.branchId, state.departmentId]);

  // ============= RESPONSE HANDLERS =============
  useEffect(() => {
    if (createHolidaySuccess) {
      showMessage('success', 'Holiday added successfully');
      fetchHolidays();
      setShowHolidayForm(false);
      setHolidayForm({
        reason: '',
        holiday_date: moment().format('YYYY-MM-DD'),
        is_active: 1,
        created_by: currentUserId
      });
      dispatch(resetHolidayStatus());
    }
  }, [createHolidaySuccess]);

  // ============= FETCH DATA =============
  const fetchEmployees = async () => {
    try {
      setLoading(true);
      await dispatch(getEmployee({ is_active: 1 }));
    } catch (error) {
      showMessage('error', 'Failed to load employees');
    }
  };

  const fetchHolidays = async () => {
    try {
      await dispatch(getHoliday({ is_active: 1 }));
    } catch (error) {
      console.error('Failed to fetch holidays:', error);
    }
  };

  const fetchAttendanceData = async () => {
    try {
      setLoading(true);
      const req = {
        attendanceDate: moment(state.month).format('YYYY-MM-DD'),
        branchId: state.branchId === null ? null : state.branchId,
        departmentId: state.departmentId === null ? null : state.departmentId
      };
      await dispatch(getStaffAttendanceList(req));
    } catch (error) {
      console.error('Failed to fetch attendance:', error);
      setLoading(false);
    }
  };

  // ============= PROCESS EMPLOYEE DATA =============
  useEffect(() => {
    if (employeeData && employeeData.length > 0) {
      setOptionListState(prev => ({
        ...prev,
        employeeList: employeeData
      }));

      // Extract unique branches
      const branchMap = new Map();
      const deptMap = new Map();
      
      employeeData.forEach(emp => {
        if (emp.branchId && emp.branchName) {
          branchMap.set(emp.branchId, { branchId: emp.branchId, branchName: emp.branchName });
        }
        if (emp.departmentId && emp.departmentName) {
          deptMap.set(emp.departmentId, { departmentId: emp.departmentId, departmentName: emp.departmentName });
        }
      });

      const branches = roleIdforRole === 1 
        ? [{ branchId: null, branchName: "All" }, ...Array.from(branchMap.values())]
        : Array.from(branchMap.values()).filter(b => b.branchId === branchIdforRole);

      setOptionListState(prev => ({
        ...prev,
        branchList: branches,
        departmentList: [{ departmentId: null, departmentName: "All" }, ...Array.from(deptMap.values())]
      }));

      setLoading(false);
    }
  }, [employeeData, roleIdforRole, branchIdforRole]);

  // ============= PROCESS ATTENDANCE DATA =============
  useEffect(() => {
    if (monthlyAttendance?.attendanceDetail) {
      setAttendanceData({
        attendanceDetail: monthlyAttendance.attendanceDetail || [],
        monthCount: monthlyAttendance.monthCount || {},
        perDayAbsent: monthlyAttendance.perDayAbsent || {},
        perDayPresent: monthlyAttendance.perDayPresent || {}
      });
      setLoading(false);
    }
  }, [monthlyAttendance]);

  // ============= PROCESS HOLIDAY DATA =============
  useEffect(() => {
    if (holidayData && holidayData.length > 0) {
      const formattedHolidays = holidayData.map((holiday, index) => ({
        id: holiday.holidayId || index,
        holidayId: holiday.holidayId,
        holidayName: holiday.reason || 'Holiday',
        holidayDate: moment(holiday.holidayDate).format('YYYY-MM-DD'),
        description: holiday.reason || '',
        isActive: holiday.isActive
      }));
      setHolidays(formattedHolidays);
    } else {
      setHolidays([]);
    }
  }, [holidayData]);

  // ============= UTILITY FUNCTIONS =============
  const isHoliday = (date) => {
    return holidays.some(holiday => holiday.holidayDate === date);
  };

  const getHolidayName = (date) => {
    const holiday = holidays.find(h => h.holidayDate === date);
    return holiday ? holiday.holidayName : null;
  };

  const renderIcon = (status, date) => {
    if (date && isHoliday(date)) {
      return <IconMoodSmile className="w-4 h-4 text-purple-600" title={getHolidayName(date)} />;
    }
    
    switch (status) {
      case "present":
        return <IconCheckCircle className="w-4 h-4 text-success" />;
      case "absent":
        return <IconXCircle className="w-4 h-4 text-danger" />;
      case "halfday":
        return <IconClock className="w-4 h-4 text-primary" />;
      case "holiday":
        return <IconMoodSmile className="w-4 h-4 text-purple-600" />;
      case "sunday":
        return <IconSun className="w-4 h-4 text-warning" />;
      default:
        return <span className="text-gray-400">-</span>;
    }
  };

  // ============= HOLIDAY HANDLERS =============
  const handleSaveHoliday = async () => {
    if (!holidayForm.reason?.trim()) {
      showMessage('error', 'Please enter holiday name');
      return;
    }
    if (!holidayForm.holiday_date) {
      showMessage('error', 'Please select holiday date');
      return;
    }

    try {
      await dispatch(createHoliday(holidayForm));
    } catch (error) {
      showMessage('error', 'Failed to add holiday');
    }
  };

  const deleteHoliday = (holidayId) => {
    showMessage(
      'warning',
      'Are you sure you want to delete this holiday?',
      async () => {
        try {
          await dispatch(deleteHoliday(holidayId));
          showMessage('success', 'Holiday deleted successfully');
          fetchHolidays();
        } catch (error) {
          showMessage('error', 'Failed to delete holiday');
        }
      },
      'Yes, delete it'
    );
  };

  // ============= FILTER HANDLERS =============
  const onMonthChange = (e) => {
    setState(prev => ({ ...prev, month: e.target.value }));
  };

  const onBranchFilter = (e) => {
    const value = e.target.value === "null" ? null : parseInt(e.target.value);
    setState(prev => ({ ...prev, branchId: value, departmentId: null }));
  };

  const onDepartmentFilter = (e) => {
    const value = e.target.value === "null" ? null : parseInt(e.target.value);
    setState(prev => ({ ...prev, departmentId: value }));
  };

  // ============= EXPORT FUNCTION =============
  const exportToExcel = () => {
    const wb = XLSX.utils.book_new();
    const monthLabel = moment(state.month).format('MMMM YYYY');
    const daysInMonth = moment(state.month).daysInMonth();
    
    const titleRow = [`Staff Attendance Report for ${monthLabel}`];
    const emptyRow = [];

    // Calculate day totals
    const dayTotals = Array.from({ length: daysInMonth }, (_, i) => {
      const day = String(i + 1).padStart(2, '0');
      const dateKey = `${moment(state.month).format('YYYY-MM')}-${day}`;
      let presentCount = 0;
      let halfDayCount = 0;
      let absentCount = 0;
      
      attendanceData?.attendanceDetail?.forEach((emp) => {
        const status = emp.dailyStatus?.[dateKey];
        if (status === "present") presentCount++;
        else if (status === "halfday") halfDayCount++;
        else if (status === "absent") absentCount++;
      });
      
      return { presentCount, halfDayCount, absentCount };
    });

    const headers = [
      ['No', 'Employee Name', 'Summary', '', '', ...Array.from({ length: daysInMonth }, (_, i) => (i + 1))],
      ['', '', 'Present', 'Half Day', 'Absent', ...Array(daysInMonth).fill('')],
      ['', 'Present (P)', '', '', '', ...dayTotals.map(day => day.presentCount)],
      ['', 'Half Day (H)', '', '', '', ...dayTotals.map(day => day.halfDayCount)],
      ['', 'Absent (A)', '', '', '', ...dayTotals.map(day => day.absentCount)]
    ];

    const dataRows = attendanceData?.attendanceDetail?.map((employee, index) => [
      index + 1,
      employee.staffName,
      employee?.presentCount || 0,
      employee?.halfDayCount || 0,
      employee?.absentCount || 0,
      ...Array.from({ length: daysInMonth }, (_, i) => {
        const day = String(i + 1).padStart(2, '0');
        const dateKey = `${moment(state.month).format('YYYY-MM')}-${day}`;
        const status = employee?.dailyStatus[dateKey] || "";
        
        if (isHoliday(dateKey)) return "HD";
        
        switch (status) {
          case "present": return "P";
          case "absent": return "A";
          case "halfday": return "H";
          case "sunday": return "S";
          default: return "X";
        }
      })
    ]);

    const finalData = [
      titleRow,
      emptyRow,
      ...headers,
      ...(dataRows || [])
    ];

    const ws = XLSX.utils.aoa_to_sheet(finalData);
    
    ws['!cols'] = [
      { wch: 5 },   // No
      { wch: 25 },  // Employee Name
      { wch: 8 },   // Present
      { wch: 8 },   // Half Day
      { wch: 8 },   // Absent
      ...Array(daysInMonth).fill({ wch: 5 }) // Days
    ];

    ws['!merges'] = [
      { s: { r: 0, c: 0 }, e: { r: 0, c: daysInMonth + 4 } }, // Title merge
      { s: { r: 2, c: 2 }, e: { r: 2, c: 4 } }  // Summary header merge
    ];

    XLSX.utils.book_append_sheet(wb, ws, "Attendance");

    // Legend sheet
    const legendData = [
      ["LEGEND"],
      ["Code", "Description"],
      ["P", "Present"],
      ["H", "Half Day"],
      ["A", "Absent"],
      ["HD", "Holiday"],
      ["S", "Sunday"],
      ["X", "Not Attendance Marked"]
    ];
    const noteWs = XLSX.utils.aoa_to_sheet(legendData);
    noteWs['!cols'] = [{ wch: 10 }, { wch: 20 }];
    XLSX.utils.book_append_sheet(wb, noteWs, "Legend");

    const fileName = `Staff_Attendance_${moment(state.month).format('YYYY_MM')}.xlsx`;
    XLSX.writeFile(wb, fileName);
    showMessage('success', 'Report exported successfully');
  };

  const isLoading = loading || employeeLoading || attendanceLoading || holidayLoading;
  const daysInMonth = moment(state.month).daysInMonth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading attendance data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Filters */}
      <div className="panel">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-800 dark:text-white-light">
            Staff Attendance Report
          </h2>
        </div>

        {/* Filter Row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
          {/* Month Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Month</label>
            <input
              type="month"
              value={state.month}
              onChange={onMonthChange}
              className="form-input w-full"
            />
          </div>

          {/* Branch Filter - Only for admin */}
          {roleIdforRole === 1 && (
            <div>
              <label className="block text-sm font-medium mb-1">Branch</label>
              <select
                value={state.branchId === null ? "null" : state.branchId}
                onChange={onBranchFilter}
                className="form-select w-full"
              >
                {optionListState.branchList.map((branch) => (
                  <option 
                    key={branch.branchId} 
                    value={branch.branchId === null ? "null" : branch.branchId}
                  >
                    {branch.branchName}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Department Filter */}
          <div>
            <label className="block text-sm font-medium mb-1">Department</label>
            <select
              value={state.departmentId === null ? "null" : state.departmentId}
              onChange={onDepartmentFilter}
              className="form-select w-full"
            >
              {optionListState.departmentList.map((dept) => (
                <option 
                  key={dept.departmentId} 
                  value={dept.departmentId === null ? "null" : dept.departmentId}
                >
                  {dept.departmentName}
                </option>
              ))}
            </select>
          </div>

          {/* Action Buttons */}
          <div className="flex items-end space-x-2">
            <button onClick={exportToExcel} className="btn btn-success w-full">
              <IconDownload className="w-4 h-4 mr-2" />
              Export Excel
            </button>
            <button onClick={() => setShowHolidayForm(true)} className="btn btn-info">
              <IconPlus className="w-4 h-4" />
            </button>
            <button onClick={() => setShowHolidayList(true)} className="btn btn-warning">
              <IconEye className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Single Table with Sticky Columns */}
        <div className="panel p-0 overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto relative" style={{ maxHeight: 'calc(500vh - 800px)' }}>
            <table className="w-full table-fixed border-collapse">
              <thead className="bg-gray-50 dark:bg-gray-800 sticky top-0 z-20">
                {/* Day Totals Row */}
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 w-[50px] p-2 border-r border-gray-200 dark:border-gray-700"></th>
                  <th className="sticky left-[50px] z-30 bg-gray-50 dark:bg-gray-800 w-[300px] p-2 border-r border-gray-200 dark:border-gray-700"></th>
                  <th className="sticky left-[350px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 border-r border-gray-200 dark:border-gray-700"></th>
                  <th className="sticky left-[390px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 border-r border-gray-200 dark:border-gray-700"></th>
                  <th className="sticky left-[430px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 border-r border-gray-200 dark:border-gray-700"></th>
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = String(i + 1).padStart(2, '0');
                    const dateKey = `${moment(state.month).format('YYYY-MM')}-${day}`;
                    let presentCount = 0, halfDayCount = 0, absentCount = 0;
                    
                    attendanceData?.attendanceDetail?.forEach((emp) => {
                      const status = emp.dailyStatus?.[dateKey];
                      if (status === "present") presentCount++;
                      else if (status === "halfday") halfDayCount++;
                      else if (status === "absent") absentCount++;
                    });

                    const isHolidayDate = isHoliday(dateKey);
                    
                    return (
                      <th key={i} className="w-[45px] p-1 text-xs font-normal border-l border-gray-200 dark:border-gray-700">
                        <div className="space-y-0.5">
                          {isHolidayDate && (
                            <div className="text-purple-600 text-[10px]">🎉</div>
                          )}
                          <div className="text-success">{presentCount}</div>
                          <div className="text-primary">{halfDayCount}</div>
                          <div className="text-danger">{absentCount}</div>
                        </div>
                      </th>
                    );
                  })}
                </tr>

                {/* Day Numbers Row */}
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="sticky left-0 z-30 bg-gray-50 dark:bg-gray-800 w-[50px] p-2 font-semibold text-sm border-r border-gray-200 dark:border-gray-700">
                    No
                  </th>
                  <th className="sticky left-[50px] z-30 bg-gray-50 dark:bg-gray-800 w-[300px] p-2 font-semibold text-sm text-left border-r border-gray-200 dark:border-gray-700">
                    Employee
                  </th>
                  <th className="sticky left-[350px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 font-semibold text-sm text-success border-r border-gray-200 dark:border-gray-700">
                    P
                  </th>
                  <th className="sticky left-[390px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 font-semibold text-sm text-primary border-r border-gray-200 dark:border-gray-700">
                    H
                  </th>
                  <th className="sticky left-[430px] z-30 bg-gray-50 dark:bg-gray-800 w-[40px] p-2 font-semibold text-sm text-danger border-r border-gray-200 dark:border-gray-700">
                    A
                  </th>
                  {[...Array(daysInMonth)].map((_, i) => {
                    const day = String(i + 1).padStart(2, '0');
                    const dateKey = `${moment(state.month).format('YYYY-MM')}-${day}`;
                    const isHolidayDate = isHoliday(dateKey);
                    const holidayName = getHolidayName(dateKey);
                    
                    return (
                      <th key={i} className="w-[45px] p-1 text-sm font-semibold border-l border-gray-200 dark:border-gray-700">
                        {i + 1}
                        {isHolidayDate && (
                          <div className="text-purple-600 text-[10px] truncate" title={holidayName}>
                            {holidayName?.substring(0, 3)}
                          </div>
                        )}
                      </th>
                    );
                  })}
                </tr>
              </thead>

              <tbody>
                {attendanceData?.attendanceDetail?.map((employee, index) => (
                  <tr 
                    key={employee.staffId || index} 
                    className="border-b border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-800"
                    style={{ height: '68px' }}
                  >
                    {/* Fixed Columns */}
                    <td className="sticky left-0 z-10 bg-white dark:bg-gray-900 w-[50px] p-2 text-center border-r border-gray-200 dark:border-gray-700">
                      {index + 1}
                    </td>
                    <td className="sticky left-[50px] z-10 bg-white dark:bg-gray-900 w-[300px] p-2 border-r border-gray-200 dark:border-gray-700">
                      <div className="flex items-center">
                        <img 
                          src={employee?.staffProfile ? `${baseURL}${employee.staffProfile}` : noProfile} 
                          alt="staff" 
                          className="w-[45px] h-[45px] rounded-full object-cover mr-3"
                          crossOrigin="anonymous"
                          onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = noProfile;
                          }}
                        />
                        <div className="text-left">
                          <div className="font-semibold text-sm">{employee?.staffName}</div>
                          <div className="text-xs text-gray-500">{employee?.staffCode}</div>
                        </div>
                      </div>
                    </td>
                    <td className="sticky left-[350px] z-10 bg-white dark:bg-gray-900 w-[40px] p-2 text-center text-success font-bold border-r border-gray-200 dark:border-gray-700">
                      {employee?.presentCount || 0}
                    </td>
                    <td className="sticky left-[390px] z-10 bg-white dark:bg-gray-900 w-[40px] p-2 text-center text-primary font-bold border-r border-gray-200 dark:border-gray-700">
                      {employee?.halfDayCount || 0}
                    </td>
                    <td className="sticky left-[430px] z-10 bg-white dark:bg-gray-900 w-[40px] p-2 text-center text-danger font-bold border-r border-gray-200 dark:border-gray-700">
                      {employee?.absentCount || 0}
                    </td>

                    {/* Scrollable Day Columns */}
                    {[...Array(daysInMonth)].map((_, i) => {
                      const day = String(i + 1).padStart(2, '0');
                      const dateKey = `${moment(state.month).format('YYYY-MM')}-${day}`;
                      const status = employee?.dailyStatus?.[dateKey] || "";
                      return (
                        <td key={i} className="w-[45px] p-2 text-center border-l border-gray-200 dark:border-gray-700">
                          {renderIcon(status, isHoliday(dateKey) ? dateKey : null)}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Legend */}
        <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
          <h4 className="font-semibold mb-2">Attendance Legend</h4>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            <div className="flex items-center space-x-2">
              <IconCheckCircle className="w-4 h-4 text-success" />
              <span className="text-sm">Present</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconXCircle className="w-4 h-4 text-danger" />
              <span className="text-sm">Absent</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconClock className="w-4 h-4 text-primary" />
              <span className="text-sm">Half Day</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconMoodSmile className="w-4 h-4 text-purple-600" />
              <span className="text-sm">Holiday</span>
            </div>
            <div className="flex items-center space-x-2">
              <IconSun className="w-4 h-4 text-warning" />
              <span className="text-sm">Sunday</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="text-gray-400">-</span>
              <span className="text-sm">Not Marked</span>
            </div>
          </div>
        </div>
      </div>

      {/* Holiday Form Modal */}
      {showHolidayForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Add Holiday</h3>
              <button onClick={() => setShowHolidayForm(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4 space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Holiday Name *</label>
                <input
                  type="text"
                  value={holidayForm.reason}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, reason: e.target.value }))}
                  className="form-input w-full"
                  placeholder="Enter holiday name"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Date *</label>
                <input
                  type="date"
                  value={holidayForm.holiday_date}
                  onChange={(e) => setHolidayForm(prev => ({ ...prev, holiday_date: e.target.value }))}
                  className="form-input w-full"
                />
              </div>
            </div>
            <div className="p-4 border-t flex justify-end space-x-2">
              <button onClick={() => setShowHolidayForm(false)} className="btn btn-outline-secondary">
                Cancel
              </button>
              <button onClick={handleSaveHoliday} className="btn btn-primary" disabled={holidayLoading}>
                {holidayLoading ? 'Saving...' : 'Save Holiday'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Holiday List Modal */}
      {showHolidayList && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold">Holiday List ({holidays.length})</h3>
              <button onClick={() => setShowHolidayList(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>
            <div className="p-4 overflow-y-auto max-h-[60vh]">
              {holidays.length === 0 ? (
                <div className="text-center py-8 text-gray-500">No holidays added yet</div>
              ) : (
                <table className="w-full">
                  <thead className="bg-gray-50 dark:bg-gray-900">
                    <tr>
                      <th className="px-4 py-3 text-left">Holiday Name</th>
                      <th className="px-4 py-3 text-left">Date</th>
                      <th className="px-4 py-3 text-left">Day</th>
                      <th className="px-4 py-3 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {holidays.map(holiday => (
                      <tr key={holiday.id} className="border-b dark:border-gray-700">
                        <td className="px-4 py-3 font-medium">{holiday.holidayName}</td>
                        <td className="px-4 py-3">{moment(holiday.holidayDate).format('DD MMMM YYYY')}</td>
                        <td className="px-4 py-3">{moment(holiday.holidayDate).format('dddd')}</td>
                        <td className="px-4 py-3">
                          <button
                            onClick={() => deleteHoliday(holiday.holidayId)}
                            className="btn btn-outline-danger btn-sm"
                          >
                            <IconTrashLines className="w-3 h-3 mr-1" /> Delete
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
            <div className="p-4 border-t flex justify-end">
              <button onClick={() => setShowHolidayList(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AttendanceReport;