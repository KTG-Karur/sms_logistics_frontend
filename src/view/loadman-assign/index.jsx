import { useState, useEffect, useMemo, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate } from 'react-router-dom';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Tippy from '@tippyjs/react';
import { showMessage, findArrObj } from '../../util/AllFunction';
import Select from 'react-select';
import IconPlus from '../../components/Icon/IconPlus';
import IconUser from '../../components/Icon/IconUser';
import IconPackage from '../../components/Icon/IconBox';
import IconTruck from '../../components/Icon/IconTruck';
import IconEye from '../../components/Icon/IconEye';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconCalculator from '../../components/Icon/IconCalculator';
import IconDollar from '../../components/Icon/IconDollarSign';

import {
  getTripPackageLoadmen,
  assignLoadmenToTripPackages,
  calculateTripLoadmanSalary,
  resetLoadmanSalaryStatus
} from '../../redux/loadmanSalarySlice';
import { getEmployee } from '../../redux/employeeSlice';
import { getTripById } from '../../redux/tripSlice';
import { getPackageType } from '../../redux/packageTypeSlice';

const LoadmanPackageAssignment = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { tripId } = useParams();

  // Redux state
  const loadmanSalaryState = useSelector((state) => state.LoadmanSalarySlice || {});
  const {
    tripPackageLoadmen = null,
    assignmentResults = null,
    calculateSuccess = false,
    loading = false,
    error = null
  } = loadmanSalaryState;

  const tripState = useSelector((state) => state.TripSlice || {});
  const { currentTrip = null } = tripState;

  const employeeState = useSelector((state) => state.EmployeeSlice || {});
  const { employeeData = [] } = employeeState;

  const packageTypeState = useSelector((state) => state.PackageTypeSlice || {});
  const { packageTypesData = [] } = packageTypeState;

  // Local states
  const [activeTab, setActiveTab] = useState('assign');
  const [selectedPackageType, setSelectedPackageType] = useState(null);
  const [assignments, setAssignments] = useState([]);
  const [availableLoadmen, setAvailableLoadmen] = useState([]);
  const [showAddAssignment, setShowAddAssignment] = useState(false);
  const [newAssignment, setNewAssignment] = useState({
    packageTypeId: '',
    loadmanId: '',
    loadmanType: 'both',
    quantity: 1
  });
  const [salaryResult, setSalaryResult] = useState(null);
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: ''
  });
  const [tripBookings, setTripBookings] = useState([]);
  const [loadingData, setLoadingData] = useState({
    trip: false,
    loadmen: false,
    packageTypes: false,
    assignments: false
  });

  // Load initial data
  useEffect(() => {
    dispatch(setPageTitle('Loadman Package Assignment'));
    if (tripId) {
      fetchAllData();
    }
  }, [dispatch, tripId]);

  // Fetch all data in parallel
  const fetchAllData = async () => {
    setLoadingData({
      trip: true,
      loadmen: true,
      packageTypes: true,
      assignments: true
    });

    try {
      await Promise.all([
        fetchTripData(),
        fetchLoadmen(),
        fetchPackageTypes(),
        fetchPackageLoadmen()
      ]);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      setLoadingData({
        trip: false,
        loadmen: false,
        packageTypes: false,
        assignments: false
      });
    }
  };

  // Fetch trip data
  const fetchTripData = async () => {
    try {
      const response = await dispatch(getTripById(tripId)).unwrap();
      // Extract bookings from trip data
      if (response?.data?.bookings) {
        setTripBookings(response.data.bookings);
      }
      return response;
    } catch (error) {
      showMessage('error', 'Failed to load trip data');
      throw error;
    }
  };

  const fetchPackageLoadmen = async () => {
    try {
      setLoadingData(prev => ({ ...prev, assignments: true }));
      const response = await dispatch(getTripPackageLoadmen({
        tripId,
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined
      })).unwrap();
      return response;
    } catch (error) {
      console.error('Failed to load package loadmen:', error);
    } finally {
      setLoadingData(prev => ({ ...prev, assignments: false }));
    }
  };

  const fetchLoadmen = async () => {
    try {
      setLoadingData(prev => ({ ...prev, loadmen: true }));
      // First try to get loadmen from the trip data
      if (currentTrip?.loadmen && currentTrip.loadmen.length > 0) {
        setAvailableLoadmen(currentTrip.loadmen);
      } else {
        // Fallback: fetch all employees and filter for loadmen
        const response = await dispatch(getEmployee({})).unwrap();
        const employees = response.data || [];
        // Filter employees where isLoadman is true
        const loadmen = employees.filter(emp => emp.isLoadman === true);
        console.log('Filtered loadmen:', loadmen);
        setAvailableLoadmen(loadmen);
      }
    } catch (error) {
      showMessage('error', 'Failed to load loadmen');
    } finally {
      setLoadingData(prev => ({ ...prev, loadmen: false }));
    }
  };

  const fetchPackageTypes = async () => {
    try {
      setLoadingData(prev => ({ ...prev, packageTypes: true }));
      await dispatch(getPackageType({})).unwrap();
    } catch (error) {
      console.error('Failed to load package types:', error);
    } finally {
      setLoadingData(prev => ({ ...prev, packageTypes: false }));
    }
  };

  // Handle success responses
  useEffect(() => {
    if (calculateSuccess) {
      showMessage('success', 'Salary calculated successfully');
      setSalaryResult(assignmentResults);
      dispatch(resetLoadmanSalaryStatus());
    }
    if (error) {
      showMessage('error', error);
      dispatch(resetLoadmanSalaryStatus());
    }
  }, [calculateSuccess, error, assignmentResults, dispatch]);

  // Get package types from trip bookings
  const tripPackageTypes = useMemo(() => {
    if (!tripBookings || tripBookings.length === 0) return [];
    
    const types = new Map();
    tripBookings.forEach(booking => {
      booking.packages?.forEach(pkg => {
        if (pkg.packageType) {
          types.set(pkg.packageType.package_type_id, {
            package_type_id: pkg.packageType.package_type_id,
            package_type_name: pkg.packageType.package_type_name,
            quantity: pkg.quantity,
            total_amount: pkg.total_package_charge
          });
        }
      });
    });
    
    return Array.from(types.values());
  }, [tripBookings]);

  // Get loadmen options
  const loadmanOptions = useMemo(() => {
    console.log('Available loadmen for options:', availableLoadmen);
    return (availableLoadmen || []).map(loadman => ({
      value: loadman.employee_id || loadman.employeeId,
      label: `${loadman.employee_name || loadman.employeeName} - ${loadman.mobile_no || loadman.mobileNo || 'No mobile'}`,
      data: loadman
    }));
  }, [availableLoadmen]);

  // Get package type options
  const packageTypeOptions = useMemo(() => {
    console.log('Package types data:', packageTypesData);
    // First try to use package types from the trip
    if (tripPackageTypes.length > 0) {
      return tripPackageTypes.map(pt => ({
        value: pt.package_type_id,
        label: pt.package_type_name,
        data: pt
      }));
    }
    // Fallback to all package types
    return (packageTypesData || []).map(pt => ({
      value: pt.package_type_id,
      label: pt.package_type_name,
      data: pt
    }));
  }, [packageTypesData, tripPackageTypes]);

  // Handle new assignment form
  const handleNewAssignmentChange = (name, value) => {
    setNewAssignment(prev => ({ ...prev, [name]: value }));
  };

  const addAssignment = () => {
    if (!newAssignment.packageTypeId) {
      showMessage('error', 'Please select package type');
      return;
    }
    if (!newAssignment.loadmanId) {
      showMessage('error', 'Please select loadman');
      return;
    }
    if (newAssignment.quantity < 1) {
      showMessage('error', 'Quantity must be at least 1');
      return;
    }

    // Find package type from either source
    const packageType = packageTypesData.find(pt => pt.package_type_id === newAssignment.packageTypeId) ||
                       tripPackageTypes.find(pt => pt.package_type_id === newAssignment.packageTypeId);
    
    const loadman = availableLoadmen.find(l => 
      (l.employee_id || l.employeeId) === newAssignment.loadmanId
    );

    setAssignments(prev => [
      ...prev,
      {
        ...newAssignment,
        packageTypeName: packageType?.package_type_name || packageType?.package_type_name,
        loadmanName: loadman?.employee_name || loadman?.employeeName,
        id: Date.now() // temporary id
      }
    ]);

    // Reset form
    setNewAssignment({
      packageTypeId: '',
      loadmanId: '',
      loadmanType: 'both',
      quantity: 1
    });
    setShowAddAssignment(false);
  };

  const removeAssignment = (id) => {
    setAssignments(prev => prev.filter(a => a.id !== id));
  };

  // Submit assignments
  const handleSubmitAssignments = async () => {
    if (assignments.length === 0) {
      showMessage('error', 'Please add at least one assignment');
      return;
    }

    try {
      await dispatch(assignLoadmenToTripPackages({
        tripId,
        assignments: assignments.map(a => ({
          packageTypeId: a.packageTypeId,
          loadmanId: a.loadmanId,
          loadmanType: a.loadmanType,
          quantity: a.quantity
        }))
      })).unwrap();
      
      showMessage('success', 'Assignments saved successfully');
      setAssignments([]);
      fetchPackageLoadmen();
    } catch (error) {
      showMessage('error', error || 'Failed to save assignments');
    }
  };

  // Calculate salary
  const handleCalculateSalary = async () => {
    try {
      await dispatch(calculateTripLoadmanSalary(tripId)).unwrap();
    } catch (error) {
      showMessage('error', error || 'Failed to calculate salary');
    }
  };

  // Loadman type badge
  const getLoadmanTypeBadge = (type) => {
    const config = {
      pickup: 'bg-blue-100 text-blue-800',
      drop: 'bg-green-100 text-green-800',
      both: 'bg-purple-100 text-purple-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${config[type] || config.both}`}>
        {type?.toUpperCase()}
      </span>
    );
  };

  const isLoading = loadingData.trip || loadingData.loadmen || loadingData.packageTypes || loadingData.assignments || loading;

  if (!currentTrip && isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Loadman Package Assignment</h1>
            <p className="text-gray-600 mt-1">
              Trip #{currentTrip?.trip_number} - {currentTrip?.trip_date}
            </p>
          </div>
          <button
            onClick={() => navigate('/loadman-salary')}
            className="btn btn-outline-secondary"
          >
            Back to Salary Management
          </button>
        </div>

        {/* Trip Summary */}
        {currentTrip && (
          <div className="bg-blue-50 rounded-lg p-4 mt-4 border border-blue-200">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <div className="text-xs text-gray-500">From Center</div>
                <div className="font-medium">{currentTrip.fromCenter?.office_center_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">To Center</div>
                <div className="font-medium">{currentTrip.toCenter?.office_center_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Vehicle</div>
                <div className="font-medium">{currentTrip.vehicle?.vehicle_number_plate}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Driver</div>
                <div className="font-medium">{currentTrip.driver?.employee_name}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500">Status</div>
                <div className="font-medium capitalize">{currentTrip.status}</div>
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="border-b border-gray-200 mt-6">
          <nav className="flex -mb-px">
            <button
              onClick={() => setActiveTab('assign')}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'assign'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <IconPlus className="w-4 h-4 inline mr-1" />
              Assign Loadmen
            </button>
            <button
              onClick={() => {
                setActiveTab('view');
                fetchPackageLoadmen();
              }}
              className={`mr-4 py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'view'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <IconEye className="w-4 h-4 inline mr-1" />
              View Assignments
            </button>
            <button
              onClick={() => {
                setActiveTab('salary');
                setSalaryResult(tripPackageLoadmen);
              }}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'salary'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <IconCalculator className="w-4 h-4 inline mr-1" />
              Salary Summary
            </button>
          </nav>
        </div>
      </div>

      {/* Content */}
      <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-6">
        {activeTab === 'assign' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Assign Loadmen to Packages</h2>
              <button
                onClick={() => setShowAddAssignment(!showAddAssignment)}
                className="btn btn-primary"
                disabled={loadingData.loadmen || loadingData.packageTypes}
              >
                <IconPlus className="w-4 h-4 mr-1" />
                Add Assignment
              </button>
            </div>

            {/* Debug Info - Remove in production */}
            <div className="text-xs text-gray-500 mb-2">
              <div>Available Loadmen: {availableLoadmen.length}</div>
              <div>Package Types: {packageTypeOptions.length}</div>
              {availableLoadmen.length === 0 && (
                <div className="text-yellow-600 mt-1">
                  ⚠️ No loadmen found. Make sure employees have isLoadman = true
                </div>
              )}
            </div>

            {/* Add Assignment Form */}
            {showAddAssignment && (
              <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <h3 className="font-medium mb-3">New Assignment</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                  <div>
                    <label className="block text-sm font-medium mb-1">Package Type *</label>
                    <Select
                      options={packageTypeOptions}
                      value={packageTypeOptions.find(opt => opt.value === newAssignment.packageTypeId)}
                      onChange={(opt) => handleNewAssignmentChange('packageTypeId', opt?.value)}
                      placeholder="Select package"
                      className="react-select"
                      classNamePrefix="select"
                      isLoading={loadingData.packageTypes}
                      noOptionsMessage={() => packageTypeOptions.length === 0 ? 'No package types available' : 'No options'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Loadman *</label>
                    <Select
                      options={loadmanOptions}
                      value={loadmanOptions.find(opt => opt.value === newAssignment.loadmanId)}
                      onChange={(opt) => handleNewAssignmentChange('loadmanId', opt?.value)}
                      placeholder="Select loadman"
                      className="react-select"
                      classNamePrefix="select"
                      isLoading={loadingData.loadmen}
                      noOptionsMessage={() => loadmanOptions.length === 0 ? 'No loadmen available' : 'No options'}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Type *</label>
                    <select
                      value={newAssignment.loadmanType}
                      onChange={(e) => handleNewAssignmentChange('loadmanType', e.target.value)}
                      className="form-select w-full"
                    >
                      <option value="both">Both Pickup & Drop</option>
                      <option value="pickup">Pickup Only</option>
                      <option value="drop">Drop Only</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Quantity *</label>
                    <input
                      type="number"
                      value={newAssignment.quantity}
                      onChange={(e) => handleNewAssignmentChange('quantity', parseInt(e.target.value) || 1)}
                      min="1"
                      className="form-input w-full"
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-3">
                  <button
                    onClick={() => setShowAddAssignment(false)}
                    className="btn btn-outline-secondary"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addAssignment}
                    className="btn btn-primary"
                  >
                    Add
                  </button>
                </div>
              </div>
            )}

            {/* Assignments List */}
            {assignments.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Package Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Loadman</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Type</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Quantity</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {assignments.map((a) => (
                      <tr key={a.id}>
                        <td className="px-3 py-2 text-sm">{a.packageTypeName}</td>
                        <td className="px-3 py-2 text-sm">{a.loadmanName}</td>
                        <td className="px-3 py-2 text-sm">{getLoadmanTypeBadge(a.loadmanType)}</td>
                        <td className="px-3 py-2 text-sm">{a.quantity}</td>
                        <td className="px-3 py-2 text-sm">
                          <button
                            onClick={() => removeAssignment(a.id)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <IconX className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No assignments added yet. Click "Add Assignment" to start.
              </div>
            )}

            {/* Submit Button */}
            {assignments.length > 0 && (
              <div className="flex justify-end">
                <button
                  onClick={handleSubmitAssignments}
                  className="btn btn-success"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Assignments'}
                </button>
              </div>
            )}
          </div>
        )}

        {activeTab === 'view' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Current Assignments</h2>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, startDate: e.target.value }))}
                  className="form-input text-sm"
                  placeholder="Start Date"
                />
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => setFilters(prev => ({ ...prev, endDate: e.target.value }))}
                  className="form-input text-sm"
                  placeholder="End Date"
                />
                <button
                  onClick={fetchPackageLoadmen}
                  className="btn btn-primary"
                  disabled={loadingData.assignments}
                >
                  {loadingData.assignments ? 'Loading...' : 'Apply Filter'}
                </button>
              </div>
            </div>

            {/* Summary */}
            {tripPackageLoadmen?.summary && (
              <div className="grid grid-cols-2 md:grid-cols-5 gap-3 bg-gray-50 p-4 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500">Total Earnings</div>
                  <div className="font-bold text-green-600">₹{tripPackageLoadmen.summary.total_earnings}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Pickup Charges</div>
                  <div className="font-medium">₹{tripPackageLoadmen.summary.total_pickup_charges}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Drop Charges</div>
                  <div className="font-medium">₹{tripPackageLoadmen.summary.total_drop_charges}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Total Packages</div>
                  <div className="font-medium">{tripPackageLoadmen.summary.total_packages}</div>
                </div>
                <div>
                  <div className="text-xs text-gray-500">Unique Loadmen</div>
                  <div className="font-medium">{tripPackageLoadmen.summary.unique_loadmen}</div>
                </div>
              </div>
            )}

            {/* Bookings with Packages */}
            {tripPackageLoadmen?.bookings && tripPackageLoadmen.bookings.length > 0 ? (
              <div className="space-y-4">
                {tripPackageLoadmen.bookings.map((booking, idx) => (
                  <div key={idx} className="border rounded-lg overflow-hidden">
                    <div className="bg-gray-50 p-3 border-b">
                      <div className="font-medium">Booking #{booking.booking_number}</div>
                    </div>
                    <div className="p-3">
                      {booking.package_types.map((pt, pidx) => (
                        <div key={pidx} className="mb-4 last:mb-0">
                          <div className="flex justify-between items-center mb-2">
                            <div className="font-medium text-primary">{pt.package_type_name}</div>
                            <div className="text-sm">Qty: {pt.total_quantity}</div>
                          </div>
                          <div className="overflow-x-auto">
                            <table className="min-w-full divide-y divide-gray-200">
                              <thead className="bg-gray-50">
                                <tr>
                                  <th className="px-3 py-2 text-left text-xs font-medium">Loadman</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium">Type</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium">Amount</th>
                                  <th className="px-3 py-2 text-left text-xs font-medium">Per Unit</th>
                                </tr>
                              </thead>
                              <tbody>
                                {pt.assignments.map((ass, aidx) => (
                                  <tr key={aidx}>
                                    <td className="px-3 py-2 text-sm">{ass.loadman?.employee_name}</td>
                                    <td className="px-3 py-2 text-sm">{getLoadmanTypeBadge(ass.loadman_type)}</td>
                                    <td className="px-3 py-2 text-sm">₹{ass.amount_earned}</td>
                                    <td className="px-3 py-2 text-sm">₹{ass.amount_per_unit}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No loadman assignments found for this trip
              </div>
            )}

            {/* Calculate Salary Button */}
            <div className="flex justify-end">
              <button
                onClick={handleCalculateSalary}
                className="btn btn-success"
                disabled={loading}
              >
                {loading ? 'Calculating...' : 'Calculate Salary for This Trip'}
              </button>
            </div>
          </div>
        )}

        {activeTab === 'salary' && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-lg font-semibold">Salary Summary</h2>
              <button
                onClick={handleCalculateSalary}
                className="btn btn-outline-primary"
                disabled={loading}
              >
                <IconCalculator className="w-4 h-4 mr-1" />
                Recalculate
              </button>
            </div>

            {salaryResult?.loadmen && salaryResult.loadmen.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium">Loadman</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Pickup</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Drop</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Handling</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Total</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Packages</th>
                      <th className="px-3 py-2 text-left text-xs font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {salaryResult.loadmen.map((loadman, idx) => (
                      <tr key={idx}>
                        <td className="px-3 py-2 text-sm font-medium">{loadman.loadman_name}</td>
                        <td className="px-3 py-2 text-sm">₹{loadman.total_pickup_charges}</td>
                        <td className="px-3 py-2 text-sm">₹{loadman.total_drop_charges}</td>
                        <td className="px-3 py-2 text-sm">₹{loadman.total_handling_charges}</td>
                        <td className="px-3 py-2 text-sm font-bold text-green-600">₹{loadman.total_amount}</td>
                        <td className="px-3 py-2 text-sm">{loadman.package_count}</td>
                        <td className="px-3 py-2 text-sm">
                          <Tippy content="Make Payment">
                            <button
                              onClick={() => navigate(`/loadman-salary?loadmanId=${loadman.loadman_id}`)}
                              className="text-primary hover:text-primary/80"
                            >
                              <IconDollar className="w-4 h-4" />
                            </button>
                          </Tippy>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500">
                No salary data available. Click "Calculate Salary" to generate.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LoadmanPackageAssignment;