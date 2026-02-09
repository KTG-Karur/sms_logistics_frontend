import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { setPageTitle } from '../../redux/themeStore/themeConfigSlice';
import Table from '../../util/Table';
import { showMessage } from '../../util/AllFunction';
import _ from 'lodash';
import IconUsers from '../../components/Icon/IconUsers';
import IconCalendar from '../../components/Icon/IconCalendar';
import IconDollarSign from '../../components/Icon/IconMoney';
import IconWallet from '../../components/Icon/IconCashBanknotes';
import IconEye from '../../components/Icon/IconEye';
import IconCheck from '../../components/Icon/IconCheck';
import IconX from '../../components/Icon/IconX';
import IconTruck from '../../components/Icon/IconTruck';
import IconPackage from '../../components/Icon/IconPackage';
import IconPlus from '../../components/Icon/IconPlus';
import IconMinus from '../../components/Icon/IconMinus';
import IconEdit from '../../components/Icon/IconEdit';
import ModelViewBox from '../../util/ModelViewBox';
import Tippy from '@tippyjs/react';

const SalaryCalculation = () => {
    const dispatch = useDispatch();

    // Format date to DD/MM/YYYY for display
    const formatDisplayDate = (date) => {
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    // Format date to YYYY-MM-DD for input[type="date"]
    const formatInputDate = (date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    // Get today's date
    const getTodayDate = () => {
        return new Date();
    };

    // Product types with different pick and drop rates
    const productTypes = [
        { id: 1, name: 'Small Box', pickRate: 20, dropRate: 25 },
        { id: 2, name: 'Medium Box', pickRate: 35, dropRate: 40 },
        { id: 3, name: 'Large Box', pickRate: 50, dropRate: 60 },
        { id: 4, name: 'Furniture', pickRate: 80, dropRate: 100 },
        { id: 5, name: 'Electronics', pickRate: 60, dropRate: 70 },
        { id: 6, name: 'Fragile Items', pickRate: 70, dropRate: 90 },
    ];

    // Dummy employee data
    const dummyEmployees = [
        { 
            id: 1, 
            name: 'John Doe', 
            role: 'employee',
            dailySalary: 2000,
            presentDays: 26,
            deductions: [
                {
                    id: 1,
                    amount: 500,
                    reason: 'Late arrival (3 times)',
                    date: '01/02/2026',
                    type: 'deduction'
                }
            ],
            extras: [
                {
                    id: 1,
                    amount: 1000,
                    reason: 'Overtime work',
                    date: '02/02/2026',
                    type: 'extra'
                }
            ],
            paymentHistory: [],
            basicSalary: 2000 * 26,
            totalDeductions: 500,
            totalExtras: 1000,
            totalSalary: (2000 * 26) - 500 + 1000,
            isPaid: false,
            paidAmount: 0,
            paymentDate: ''
        },
        { 
            id: 2, 
            name: 'Jane Smith', 
            role: 'employee',
            dailySalary: 1800,
            presentDays: 25,
            deductions: [],
            extras: [],
            paymentHistory: [
                {
                    id: 1,
                    amount: 45000,
                    date: '05/02/2026',
                    remaining: 0,
                    note: 'Full payment'
                }
            ],
            basicSalary: 1800 * 25,
            totalDeductions: 0,
            totalExtras: 0,
            totalSalary: 1800 * 25,
            isPaid: true,
            paidAmount: 45000,
            paymentDate: '05/02/2026'
        },
        { 
            id: 3, 
            name: 'Mike Johnson', 
            role: 'employee',
            dailySalary: 2200,
            presentDays: 27,
            deductions: [
                {
                    id: 1,
                    amount: 1000,
                    reason: 'Damage to office property',
                    date: '02/02/2026',
                    type: 'deduction'
                },
                {
                    id: 2,
                    amount: 500,
                    reason: 'Late submission',
                    date: '03/02/2026',
                    type: 'deduction'
                }
            ],
            extras: [
                {
                    id: 1,
                    amount: 1500,
                    reason: 'Weekend duty',
                    date: '04/02/2026',
                    type: 'extra'
                }
            ],
            paymentHistory: [],
            basicSalary: 2200 * 27,
            totalDeductions: 1500,
            totalExtras: 1500,
            totalSalary: (2200 * 27) - 1500 + 1500,
            isPaid: false,
            paidAmount: 0,
            paymentDate: ''
        },
    ];

    // Dummy driver data - drivers have daily salary AND can work as loadmen
    const dummyDrivers = [
        { 
            id: 101, 
            name: 'Robert Wilson', 
            role: 'driver',
            dailySalary: 1500,
            presentDays: 26,
            loadmanWork: [
                {
                    id: 1,
                    productTypeId: 2,
                    productName: 'Medium Box',
                    pickCount: 15,
                    dropCount: 12,
                    pickRate: 35,
                    dropRate: 40,
                    date: '01/02/2026'
                },
                {
                    id: 2,
                    productTypeId: 3,
                    productName: 'Large Box',
                    pickCount: 8,
                    dropCount: 8,
                    pickRate: 50,
                    dropRate: 60,
                    date: '02/02/2026'
                }
            ],
            deductions: [],
            extras: [],
            paymentHistory: [],
            driverSalary: 1500 * 26,
            loadmanSalary: (15 * 35) + (12 * 40) + (8 * 50) + (8 * 60),
            totalDeductions: 0,
            totalExtras: 0,
            totalSalary: (1500 * 26) + (15 * 35) + (12 * 40) + (8 * 50) + (8 * 60),
            isPaid: false,
            paidAmount: 0,
            paymentDate: ''
        },
        { 
            id: 102, 
            name: 'David Brown', 
            role: 'driver',
            dailySalary: 1600,
            presentDays: 25,
            loadmanWork: [
                {
                    id: 1,
                    productTypeId: 1,
                    productName: 'Small Box',
                    pickCount: 25,
                    dropCount: 22,
                    pickRate: 20,
                    dropRate: 25,
                    date: '03/02/2026'
                },
                {
                    id: 2,
                    productTypeId: 4,
                    productName: 'Furniture',
                    pickCount: 5,
                    dropCount: 5,
                    pickRate: 80,
                    dropRate: 100,
                    date: '04/02/2026'
                }
            ],
            deductions: [
                {
                    id: 1,
                    amount: 300,
                    reason: 'Fuel overuse',
                    date: '02/02/2026',
                    type: 'deduction'
                }
            ],
            extras: [
                {
                    id: 1,
                    amount: 800,
                    reason: 'Extra night duty',
                    date: '03/02/2026',
                    type: 'extra'
                }
            ],
            paymentHistory: [
                {
                    id: 1,
                    amount: 25000,
                    date: '04/02/2026',
                    remaining: 18300,
                    note: 'Advance payment'
                }
            ],
            driverSalary: 1600 * 25,
            loadmanSalary: (25 * 20) + (22 * 25) + (5 * 80) + (5 * 100),
            totalDeductions: 300,
            totalExtras: 800,
            totalSalary: (1600 * 25) + (25 * 20) + (22 * 25) + (5 * 80) + (5 * 100) - 300 + 800,
            isPaid: false,
            paidAmount: 25000,
            paymentDate: '04/02/2026'
        },
    ];

    // Dummy loadman data - NO daily salary, only package-based earnings
    const dummyLoadmen = [
        { 
            id: 201, 
            name: 'James Miller', 
            role: 'loadman',
            presentDays: 0, // Loadmen don't have present days for salary calculation
            packagesHandled: [
                {
                    id: 1,
                    productTypeId: 2,
                    productName: 'Medium Box',
                    pickCount: 30,
                    dropCount: 28,
                    pickRate: 35,
                    dropRate: 40,
                    date: '01/02/2026'
                },
                {
                    id: 2,
                    productTypeId: 3,
                    productName: 'Large Box',
                    pickCount: 15,
                    dropCount: 12,
                    pickRate: 50,
                    dropRate: 60,
                    date: '02/02/2026'
                }
            ],
            deductions: [
                {
                    id: 1,
                    amount: 200,
                    reason: 'Package damage',
                    date: '03/02/2026',
                    type: 'deduction'
                }
            ],
            extras: [
                {
                    id: 1,
                    amount: 600,
                    reason: 'Heavy load handling',
                    date: '04/02/2026',
                    type: 'extra'
                }
            ],
            paymentHistory: [],
            packageSalary: (30 * 35 + 28 * 40 + 15 * 50 + 12 * 60),
            totalDeductions: 200,
            totalExtras: 600,
            totalSalary: (30 * 35 + 28 * 40 + 15 * 50 + 12 * 60) - 200 + 600,
            isPaid: false,
            paidAmount: 0,
            paymentDate: ''
        },
        { 
            id: 202, 
            name: 'William Davis', 
            role: 'loadman',
            presentDays: 0,
            packagesHandled: [
                {
                    id: 1,
                    productTypeId: 1,
                    productName: 'Small Box',
                    pickCount: 45,
                    dropCount: 40,
                    pickRate: 20,
                    dropRate: 25,
                    date: '03/02/2026'
                },
                {
                    id: 2,
                    productTypeId: 5,
                    productName: 'Electronics',
                    pickCount: 8,
                    dropCount: 7,
                    pickRate: 60,
                    dropRate: 70,
                    date: '04/02/2026'
                }
            ],
            deductions: [],
            extras: [],
            paymentHistory: [
                {
                    id: 1,
                    amount: 20000,
                    date: '05/02/2026',
                    remaining: 16060,
                    note: 'Partial payment'
                }
            ],
            packageSalary: (45 * 20 + 40 * 25 + 8 * 60 + 7 * 70),
            totalDeductions: 0,
            totalExtras: 0,
            totalSalary: (45 * 20 + 40 * 25 + 8 * 60 + 7 * 70),
            isPaid: false,
            paidAmount: 20000,
            paymentDate: '05/02/2026'
        },
        { 
            id: 203, 
            name: 'Charles Garcia', 
            role: 'loadman',
            presentDays: 0,
            packagesHandled: [
                {
                    id: 1,
                    productTypeId: 6,
                    productName: 'Fragile Items',
                    pickCount: 20,
                    dropCount: 18,
                    pickRate: 70,
                    dropRate: 90,
                    date: '06/02/2026'
                }
            ],
            deductions: [],
            extras: [],
            paymentHistory: [
                {
                    id: 1,
                    amount: 2780,
                    date: '07/02/2026',
                    remaining: 0,
                    note: 'Full payment'
                }
            ],
            packageSalary: (20 * 70 + 18 * 90),
            totalDeductions: 0,
            totalExtras: 0,
            totalSalary: (20 * 70 + 18 * 90),
            isPaid: true,
            paidAmount: 2780,
            paymentDate: '07/02/2026'
        },
    ];

    // States
    const [selectedDate, setSelectedDate] = useState(getTodayDate());
    const [activeTab, setActiveTab] = useState('employees');
    const [employeeData, setEmployeeData] = useState(dummyEmployees);
    const [driverData, setDriverData] = useState(dummyDrivers);
    const [loadmanData, setLoadmanData] = useState(dummyLoadmen);
    const [currentPage, setCurrentPage] = useState(0);
    const [pageSize, setPageSize] = useState(10);
    
    // Modal states
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [showDeductionExtraModal, setShowDeductionExtraModal] = useState(false);
    const [showLoadmanWorkModal, setShowLoadmanWorkModal] = useState(false);
    const [selectedPerson, setSelectedPerson] = useState(null);
    const [selectedCategory, setSelectedCategory] = useState('');
    
    // Form states
    const [paymentForm, setPaymentForm] = useState({
        amount: '',
        paymentDate: formatInputDate(new Date()),
        note: ''
    });

    const [deductionExtraForm, setDeductionExtraForm] = useState({
        type: 'deduction',
        amount: '',
        reason: '',
        date: formatInputDate(new Date())
    });

    const [loadmanWorkForm, setLoadmanWorkForm] = useState({
        productTypeId: '',
        pickCount: '',
        dropCount: '',
        date: formatInputDate(new Date())
    });

    useEffect(() => {
        dispatch(setPageTitle('Salary Calculation'));
    }, []);

    // Handle date change
    const handleDateChange = (e) => {
        const newDate = new Date(e.target.value);
        setSelectedDate(newDate);
        showMessage('info', `Loading salary data for ${formatDisplayDate(newDate)}`);
    };

    // Calculate totals for current category
    const calculateTotals = (data) => {
        const totalSalary = data.reduce((sum, person) => sum + person.totalSalary, 0);
        const totalPaid = data.reduce((sum, person) => sum + person.paidAmount, 0);
        const totalDeductions = data.reduce((sum, person) => sum + person.totalDeductions, 0);
        const totalExtras = data.reduce((sum, person) => sum + person.totalExtras, 0);
        const totalRemaining = data.reduce((sum, person) => {
            if (!person.isPaid || person.paidAmount < person.totalSalary) {
                return sum + (person.totalSalary - person.paidAmount);
            }
            return sum;
        }, 0);

        const fullyPaid = data.filter(person => person.paidAmount >= person.totalSalary).length;
        const partiallyPaid = data.filter(person => person.paidAmount > 0 && person.paidAmount < person.totalSalary).length;
        const unpaid = data.filter(person => person.paidAmount === 0).length;

        return {
            totalSalary,
            totalPaid,
            totalDeductions,
            totalExtras,
            totalRemaining,
            fullyPaid,
            partiallyPaid,
            unpaid,
            totalCount: data.length
        };
    };

    // Get current data based on active tab
    const getCurrentData = () => {
        switch (activeTab) {
            case 'employees': return employeeData;
            case 'drivers': return driverData;
            case 'loadmen': return loadmanData;
            default: return employeeData;
        }
    };

    const currentData = getCurrentData();
    const totals = calculateTotals(currentData);

    // View details
    const viewDetails = (person, category) => {
        setSelectedPerson(person);
        setSelectedCategory(category);
        setShowDetailsModal(true);
    };

    // Open deduction/extra modal
    const openDeductionExtraModal = (person, category, type = 'deduction') => {
        setSelectedPerson(person);
        setSelectedCategory(category);
        setDeductionExtraForm({
            type: type,
            amount: '',
            reason: '',
            date: formatInputDate(new Date())
        });
        setShowDeductionExtraModal(true);
    };

    // Open loadman work modal
    const openLoadmanWorkModal = (person, category) => {
        setSelectedPerson(person);
        setSelectedCategory(category);
        setLoadmanWorkForm({
            productTypeId: '',
            pickCount: '',
            dropCount: '',
            date: formatInputDate(new Date())
        });
        setShowLoadmanWorkModal(true);
    };

    // Handle deduction/extra form change
    const handleDeductionExtraFormChange = (e) => {
        const { name, value } = e.target;
        setDeductionExtraForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle loadman work form change
    const handleLoadmanWorkFormChange = (e) => {
        const { name, value } = e.target;
        setLoadmanWorkForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Add deduction or extra
    const addDeductionExtra = () => {
        if (!deductionExtraForm.amount || !deductionExtraForm.reason) {
            showMessage('error', `Please enter amount and reason for ${deductionExtraForm.type}`);
            return;
        }

        const amount = parseFloat(deductionExtraForm.amount);
        if (isNaN(amount) || amount <= 0) {
            showMessage('error', 'Please enter a valid amount');
            return;
        }

        const newRecord = {
            id: Date.now(),
            amount: amount,
            reason: deductionExtraForm.reason,
            date: formatDisplayDate(new Date(deductionExtraForm.date)),
            type: deductionExtraForm.type
        };

        const updateFunction = (prev) => prev.map(p => {
            if (p.id === selectedPerson.id && p.role === selectedPerson.role) {
                let updatedPerson = { ...p };
                
                if (deductionExtraForm.type === 'deduction') {
                    updatedPerson = {
                        ...updatedPerson,
                        deductions: [...p.deductions, newRecord],
                        totalDeductions: p.totalDeductions + amount,
                        totalSalary: p.totalSalary - amount
                    };
                } else {
                    updatedPerson = {
                        ...updatedPerson,
                        extras: [...p.extras, newRecord],
                        totalExtras: p.totalExtras + amount,
                        totalSalary: p.totalSalary + amount
                    };
                }
                
                return updatedPerson;
            }
            return p;
        });

        switch (selectedCategory) {
            case 'employees':
                setEmployeeData(updateFunction);
                break;
            case 'drivers':
                setDriverData(updateFunction);
                break;
            case 'loadmen':
                setLoadmanData(updateFunction);
                break;
        }

        setShowDeductionExtraModal(false);
        showMessage('success', `${deductionExtraForm.type === 'deduction' ? 'Deduction' : 'Extra'} added successfully!`);
        setSelectedPerson(null);
    };

    // Add loadman work
    const addLoadmanWork = () => {
        if (!loadmanWorkForm.productTypeId || !loadmanWorkForm.pickCount || !loadmanWorkForm.dropCount) {
            showMessage('error', 'Please select product type and enter pick/drop counts');
            return;
        }

        const pickCount = parseInt(loadmanWorkForm.pickCount) || 0;
        const dropCount = parseInt(loadmanWorkForm.dropCount) || 0;
        const productType = productTypes.find(p => p.id === parseInt(loadmanWorkForm.productTypeId));

        if (!productType) {
            showMessage('error', 'Please select a valid product type');
            return;
        }

        const newWork = {
            id: Date.now(),
            productTypeId: productType.id,
            productName: productType.name,
            pickCount: pickCount,
            dropCount: dropCount,
            pickRate: productType.pickRate,
            dropRate: productType.dropRate,
            date: formatDisplayDate(new Date(loadmanWorkForm.date))
        };

        const workAmount = (pickCount * productType.pickRate) + (dropCount * productType.dropRate);

        const updateFunction = (prev) => prev.map(p => {
            if (p.id === selectedPerson.id && p.role === selectedPerson.role) {
                let updatedPerson = { ...p };
                
                if (selectedPerson.role === 'driver') {
                    updatedPerson = {
                        ...updatedPerson,
                        loadmanWork: [...p.loadmanWork, newWork],
                        loadmanSalary: p.loadmanSalary + workAmount,
                        totalSalary: p.totalSalary + workAmount
                    };
                } else if (selectedPerson.role === 'loadman') {
                    updatedPerson = {
                        ...updatedPerson,
                        packagesHandled: [...p.packagesHandled, newWork],
                        packageSalary: p.packageSalary + workAmount,
                        totalSalary: p.totalSalary + workAmount
                    };
                }
                
                return updatedPerson;
            }
            return p;
        });

        switch (selectedCategory) {
            case 'drivers':
                setDriverData(updateFunction);
                break;
            case 'loadmen':
                setLoadmanData(updateFunction);
                break;
        }

        setShowLoadmanWorkModal(false);
        showMessage('success', 'Work record added successfully!');
        setSelectedPerson(null);
    };

    // Open payment modal
    const openPaymentModal = (person, category) => {
        setSelectedPerson(person);
        setSelectedCategory(category);
        setPaymentForm({
            amount: '',
            paymentDate: formatInputDate(new Date()),
            note: ''
        });
        setShowPaymentModal(true);
    };

    // Handle payment form change
    const handlePaymentFormChange = (e) => {
        const { name, value } = e.target;
        setPaymentForm(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Process payment
    const processPayment = () => {
        if (!paymentForm.amount || isNaN(paymentForm.amount) || parseFloat(paymentForm.amount) <= 0) {
            showMessage('error', 'Please enter a valid payment amount');
            return;
        }

        const paymentAmount = parseFloat(paymentForm.amount);
        const person = selectedPerson;
        const category = selectedCategory;
        
        if (paymentAmount > (person.totalSalary - person.paidAmount)) {
            showMessage('error', `Payment amount cannot exceed remaining balance of ₹${(person.totalSalary - person.paidAmount).toLocaleString('en-IN')}`);
            return;
        }

        // Show warning before processing payment
        showMessage('warning', `Are you sure you want to process payment of ₹${paymentAmount.toLocaleString('en-IN')} to ${person.name}?`, () => {
            const newPaidAmount = person.paidAmount + paymentAmount;
            const isFullyPaid = newPaidAmount >= person.totalSalary;
            
            const newPaymentRecord = {
                id: Date.now(),
                amount: paymentAmount,
                date: formatDisplayDate(new Date(paymentForm.paymentDate)),
                remaining: person.totalSalary - newPaidAmount,
                note: paymentForm.note || `Payment towards salary`
            };

            // Update the appropriate state based on category
            const updateFunction = (prev) => prev.map(p => {
                if (p.id === person.id && p.role === person.role) {
                    const updatedPerson = {
                        ...p,
                        paidAmount: newPaidAmount,
                        paymentDate: formatDisplayDate(new Date(paymentForm.paymentDate)),
                        paymentHistory: [...p.paymentHistory, newPaymentRecord]
                    };
                    
                    if (isFullyPaid) {
                        updatedPerson.isPaid = true;
                    }
                    
                    return updatedPerson;
                }
                return p;
            });

            switch (category) {
                case 'employees':
                    setEmployeeData(updateFunction);
                    break;
                case 'drivers':
                    setDriverData(updateFunction);
                    break;
                case 'loadmen':
                    setLoadmanData(updateFunction);
                    break;
            }

            setShowPaymentModal(false);
            showMessage('success', `Payment of ₹${paymentAmount.toLocaleString('en-IN')} recorded successfully!`);
            setSelectedPerson(null);
        });
    };

    // Mark as fully paid
    const markAsFullyPaid = (person, category) => {
        const remaining = person.totalSalary - person.paidAmount;
        
        showMessage('warning', `Mark ${person.name} as fully paid with remaining amount of ₹${remaining.toLocaleString('en-IN')}?`, () => {
            const paymentRecord = {
                id: Date.now(),
                amount: remaining,
                date: formatDisplayDate(new Date()),
                remaining: 0,
                note: 'Full settlement'
            };

            const updateFunction = (prev) => prev.map(p => {
                if (p.id === person.id && p.role === person.role) {
                    return {
                        ...p,
                        isPaid: true,
                        paidAmount: p.totalSalary,
                        paymentDate: formatDisplayDate(new Date()),
                        paymentHistory: [...p.paymentHistory, paymentRecord]
                    };
                }
                return p;
            });

            switch (category) {
                case 'employees':
                    setEmployeeData(updateFunction);
                    break;
                case 'drivers':
                    setDriverData(updateFunction);
                    break;
                case 'loadmen':
                    setLoadmanData(updateFunction);
                    break;
            }

            showMessage('success', `${person.name} marked as fully paid!`);
        });
    };

    // Get columns based on active tab
    const getColumns = () => {
        // Common columns for all categories
        const baseColumns = [
            {
                Header: 'S.No',
                accessor: 'id',
                Cell: ({ row }) => <div>{row.index + 1}</div>,
                width: 80,
            },
            {
                Header: 'Name',
                accessor: 'name',
                sort: true,
                Cell: ({ value }) => (
                    <div className="font-semibold text-gray-800 dark:text-gray-200">{value}</div>
                ),
            },
            {
                Header: 'Total Salary',
                accessor: 'totalSalary',
                sort: true,
                Cell: ({ value, row }) => {
                    const person = row.original;
                    return (
                        <div>
                            <div className="text-success font-bold text-lg">₹{value.toLocaleString('en-IN')}</div>
                            {(person.totalDeductions > 0 || person.totalExtras > 0) && (
                                <div className="text-xs">
                                    {person.totalDeductions > 0 && (
                                        <div className="text-danger">
                                            -₹{person.totalDeductions.toLocaleString('en-IN')} deductions
                                        </div>
                                    )}
                                    {person.totalExtras > 0 && (
                                        <div className="text-green-600">
                                            +₹{person.totalExtras.toLocaleString('en-IN')} extras
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'Paid Amount',
                accessor: 'paidAmount',
                sort: true,
                Cell: ({ value, row }) => {
                    const remaining = row.original.totalSalary - value;
                    return (
                        <div>
                            <div className={`font-bold ${value > 0 ? 'text-green-600' : 'text-gray-500'}`}>
                                ₹{value.toLocaleString('en-IN')}
                            </div>
                            {remaining > 0 && (
                                <div className="text-xs text-red-600">
                                    ₹{remaining.toLocaleString('en-IN')} remaining
                                </div>
                            )}
                        </div>
                    );
                },
            },
            {
                Header: 'Status',
                accessor: 'status',
                Cell: ({ row }) => {
                    const person = row.original;
                    const isFullyPaid = person.paidAmount >= person.totalSalary;
                    const hasPartialPayment = person.paidAmount > 0 && !isFullyPaid;
                    
                    return (
                        <div className="flex items-center">
                            <div className={`w-3 h-3 rounded-full mr-2 ${isFullyPaid ? 'bg-success' : 'bg-danger'}`}></div>
                            <div>
                                <span className={`font-medium ${isFullyPaid ? 'text-success' : 'text-danger'}`}>
                                    {isFullyPaid ? 'Fully Paid' : hasPartialPayment ? 'Partially Paid' : 'Unpaid'}
                                </span>
                                {person.paymentDate && (
                                    <div className="text-xs text-gray-500">
                                        Last: {person.paymentDate}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                },
            },
            {
                Header: 'Actions',
                accessor: 'actions',
                Cell: ({ row }) => {
                    const person = row.original;
                    const remaining = person.totalSalary - person.paidAmount;
                    const isFullyPaid = person.paidAmount >= person.totalSalary;
                    const hasPartialPayment = person.paidAmount > 0 && !isFullyPaid;
                    
                    return (
                        <div className="flex items-center space-x-2">
                            <Tippy content="View Details">
                                <button
                                    type="button"
                                    className="btn btn-outline-info btn-sm"
                                    onClick={() => viewDetails(person, activeTab)}
                                >
                                    <IconEye className="w-4 h-4" />
                                </button>
                            </Tippy>
                            
                            <Tippy content="Add Deduction">
                                <button
                                    type="button"
                                    className="btn btn-outline-danger btn-sm"
                                    onClick={() => openDeductionExtraModal(person, activeTab, 'deduction')}
                                >
                                    <IconMinus className="w-4 h-4" />
                                </button>
                            </Tippy>
                            
                            <Tippy content="Add Extra">
                                <button
                                    type="button"
                                    className="btn btn-outline-success btn-sm"
                                    onClick={() => openDeductionExtraModal(person, activeTab, 'extra')}
                                >
                                    <IconPlus className="w-4 h-4" />
                                </button>
                            </Tippy>
                            
                            {(person.role === 'driver' || person.role === 'loadman') && (
                                <Tippy content="Add Work Record">
                                    <button
                                        type="button"
                                        className="btn btn-outline-warning btn-sm"
                                        onClick={() => openLoadmanWorkModal(person, activeTab)}
                                    >
                                        <IconPackage className="w-4 h-4" />
                                    </button>
                                </Tippy>
                            )}
                            
                            {!isFullyPaid && (
                                <Tippy content="Make Payment">
                                    <button
                                        type="button"
                                        className="btn btn-success btn-sm"
                                        onClick={() => openPaymentModal(person, activeTab)}
                                    >
                                        <IconWallet className="w-4 h-4" />
                                        <span className="ml-1">Pay</span>
                                    </button>
                                </Tippy>
                            )}
                            
                            {hasPartialPayment && remaining > 0 && (
                                <Tippy content="Mark as Fully Paid">
                                    <button
                                        type="button"
                                        className="btn btn-outline-success btn-sm"
                                        onClick={() => markAsFullyPaid(person, activeTab)}
                                    >
                                        <IconCheck className="w-4 h-4" />
                                        <span className="ml-1">Settle</span>
                                    </button>
                                </Tippy>
                            )}
                        </div>
                    );
                },
                width: 300,
            },
        ];

        switch (activeTab) {
            case 'employees':
                return [
                    ...baseColumns.slice(0, 1), // S.No
                    {
                        Header: 'Name',
                        accessor: 'name',
                        sort: true,
                        Cell: ({ value }) => (
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{value}</div>
                        ),
                    },
                    {
                        Header: 'Daily Salary',
                        accessor: 'dailySalary',
                        sort: true,
                        Cell: ({ value }) => (
                            <div className="text-primary font-medium">₹{value.toLocaleString('en-IN')}</div>
                        ),
                    },
                    {
                        Header: 'Present Days',
                        accessor: 'presentDays',
                        sort: true,
                        Cell: ({ value }) => (
                            <div>{value} days</div>
                        ),
                    },
                    ...baseColumns.slice(2) // Total Salary, Paid Amount, Status, Actions
                ];
            case 'drivers':
                return [
                    ...baseColumns.slice(0, 1), // S.No
                    {
                        Header: 'Name',
                        accessor: 'name',
                        sort: true,
                        Cell: ({ value }) => (
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{value}</div>
                        ),
                    },
                    {
                        Header: 'Daily Salary',
                        accessor: 'dailySalary',
                        sort: true,
                        Cell: ({ value }) => (
                            <div className="text-primary font-medium">₹{value.toLocaleString('en-IN')}</div>
                        ),
                    },
                    {
                        Header: 'Present Days',
                        accessor: 'presentDays',
                        sort: true,
                        Cell: ({ value }) => (
                            <div>{value} days</div>
                        ),
                    },
                    {
                        Header: 'Loadman Work',
                        accessor: 'loadmanWork',
                        Cell: ({ value, row }) => (
                            <div>
                                <div className="text-purple-600 font-medium">
                                    {value.length} work records
                                </div>
                                <div className="text-xs text-gray-500">
                                    ₹{row.original.loadmanSalary.toLocaleString('en-IN')} earned
                                </div>
                            </div>
                        ),
                    },
                    ...baseColumns.slice(2) // Total Salary, Paid Amount, Status, Actions
                ];
            case 'loadmen':
                return [
                    ...baseColumns.slice(0, 1), // S.No
                    {
                        Header: 'Name',
                        accessor: 'name',
                        sort: true,
                        Cell: ({ value }) => (
                            <div className="font-semibold text-gray-800 dark:text-gray-200">{value}</div>
                        ),
                    },
                    {
                        Header: 'Packages',
                        accessor: 'packagesHandled',
                        Cell: ({ value, row }) => (
                            <div>
                                <div className="text-purple-600 font-medium">
                                    {value.length} work records
                                </div>
                                <div className="text-xs text-gray-500">
                                    ₹{row.original.packageSalary.toLocaleString('en-IN')} earned
                                </div>
                            </div>
                        ),
                    },
                    ...baseColumns.slice(2) // Total Salary, Paid Amount, Status, Actions
                ];
            default:
                return baseColumns;
        }
    };

    // Handle pagination
    const handlePaginationChange = (pageIndex, newPageSize) => {
        setCurrentPage(pageIndex);
        setPageSize(newPageSize);
    };

    const getPaginatedData = () => {
        const startIndex = currentPage * pageSize;
        const endIndex = startIndex + pageSize;
        return currentData.slice(startIndex, endIndex);
    };

    // Get category title
    const getCategoryTitle = () => {
        switch (activeTab) {
            case 'employees': return 'Employee Salary Records';
            case 'drivers': return 'Driver Salary Records';
            case 'loadmen': return 'Loadman Salary Records';
            default: return 'Salary Records';
        }
    };

    // Get category icon
    const getCategoryIcon = () => {
        switch (activeTab) {
            case 'employees': return <IconUsers className="w-5 h-5 text-blue-600 dark:text-blue-400" />;
            case 'drivers': return <IconTruck className="w-5 h-5 text-green-600 dark:text-green-400" />;
            case 'loadmen': return <IconPackage className="w-5 h-5 text-purple-600 dark:text-purple-400" />;
            default: return <IconUsers className="w-5 h-5" />;
        }
    };

    // Render category-specific work details
    const renderWorkDetails = () => {
        if (!selectedPerson) return null;

        const workRecords = selectedPerson.role === 'driver' 
            ? selectedPerson.loadmanWork 
            : selectedPerson.role === 'loadman' 
            ? selectedPerson.packagesHandled 
            : [];

        if (workRecords.length === 0) return null;

        return (
            <div className="mt-6">
                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">
                    {selectedPerson.role === 'driver' ? 'Loadman Work Records' : 'Package Handling Records'}
                </h6>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                    {workRecords.map((work, index) => (
                        <div key={work.id} className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                            <div className="flex justify-between items-center mb-2">
                                <div className="font-medium text-gray-800 dark:text-gray-200">{work.productName}</div>
                                <div className="text-sm text-gray-500">{work.date}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-2 text-sm">
                                <div>
                                    <div className="text-gray-600 dark:text-gray-400">Pick Count</div>
                                    <div className="font-medium">{work.pickCount} × ₹{work.pickRate} = ₹{work.pickCount * work.pickRate}</div>
                                </div>
                                <div>
                                    <div className="text-gray-600 dark:text-gray-400">Drop Count</div>
                                    <div className="font-medium">{work.dropCount} × ₹{work.dropRate} = ₹{work.dropCount * work.dropRate}</div>
                                </div>
                            </div>
                            <div className="mt-2 pt-2 border-t border-gray-200 dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <span className="text-gray-600 dark:text-gray-400">Total for this record</span>
                                    <span className="font-bold text-purple-600">
                                        ₹{(work.pickCount * work.pickRate + work.dropCount * work.dropRate).toLocaleString('en-IN')}
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                    <div className="p-3 bg-purple-50 dark:bg-purple-900/20 rounded-lg">
                        <div className="flex justify-between items-center">
                            <span className="font-semibold text-purple-700 dark:text-purple-400">
                                Total {selectedPerson.role === 'driver' ? 'Loadman' : 'Package'} Earnings
                            </span>
                            <span className="font-bold text-purple-600">
                                ₹{selectedPerson.role === 'driver' 
                                    ? selectedPerson.loadmanSalary.toLocaleString('en-IN')
                                    : selectedPerson.packageSalary.toLocaleString('en-IN')}
                            </span>
                        </div>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div>
            {/* Header */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-white">Salary Calculation</h2>
                    <p className="text-gray-600 dark:text-gray-400">Calculate and process salary payments for all staff</p>
                </div>
                <div className="flex items-center">
                    {/* Date Picker */}
                    <div className="flex items-center bg-gray-100 dark:bg-gray-800 px-4 py-3 rounded-lg shadow-sm">
                        <IconCalendar className="w-5 h-5 text-primary mr-3" />
                        <div>
                            <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Salary Month</div>
                            <div className="flex items-center space-x-3">
                                <div className="font-semibold text-lg text-gray-800 dark:text-white min-w-[120px]">
                                    {formatDisplayDate(selectedDate)}
                                </div>
                                <input
                                    type="date"
                                    className="form-input border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 px-3 py-2 rounded-md text-gray-800 dark:text-white"
                                    value={formatInputDate(selectedDate)}
                                    onChange={handleDateChange}
                                    title="Select month"
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div className="mb-6">
                <ul className="flex flex-wrap -mb-px">
                    <li className="mr-2">
                        <button
                            className={`inline-block py-3 px-4 rounded-t-lg ${activeTab === 'employees' 
                                ? 'text-primary border-b-2 border-primary font-semibold bg-white dark:bg-gray-800' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('employees')}
                        >
                            <IconUsers className="w-4 h-4 inline mr-2" />
                            Employees
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block py-3 px-4 rounded-t-lg ${activeTab === 'drivers' 
                                ? 'text-primary border-b-2 border-primary font-semibold bg-white dark:bg-gray-800' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('drivers')}
                        >
                            <IconTruck className="w-4 h-4 inline mr-2" />
                            Drivers
                        </button>
                    </li>
                    <li className="mr-2">
                        <button
                            className={`inline-block py-3 px-4 rounded-t-lg ${activeTab === 'loadmen' 
                                ? 'text-primary border-b-2 border-primary font-semibold bg-white dark:bg-gray-800' 
                                : 'text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300'}`}
                            onClick={() => setActiveTab('loadmen')}
                        >
                            <IconPackage className="w-4 h-4 inline mr-2" />
                            Loadmen
                        </button>
                    </li>
                </ul>
                <div className="bg-white dark:bg-gray-800 p-4 rounded-b-lg shadow-sm border border-t-0 border-gray-200 dark:border-gray-700">
                    {/* Summary Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center mr-3">
                                    {getCategoryIcon()}
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total {activeTab.charAt(0).toUpperCase() + activeTab.slice(1)}</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                                        {totals.totalCount}
                                    </div>
                                    <div className="text-xs text-gray-500 mt-1">
                                        {totals.fullyPaid} paid • {totals.partiallyPaid} partial • {totals.unpaid} unpaid
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center mr-3">
                                    <IconDollarSign className="w-5 h-5 text-green-600 dark:text-green-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Salary</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                                        ₹{totals.totalSalary.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-lg bg-red-100 dark:bg-red-900/30 flex items-center justify-center mr-3">
                                    <IconX className="w-5 h-5 text-red-600 dark:text-red-400" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Total Deductions</div>
                                    <div className="text-xl font-bold text-gray-800 dark:text-white">
                                        ₹{totals.totalDeductions.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 shadow-sm bg-gradient-to-r from-gray-50 to-white dark:from-gray-800 dark:to-gray-900">
                            <div className="flex items-center mb-3">
                                <div className="w-10 h-10 rounded-lg bg-gradient-to-r from-primary to-primary/80 flex items-center justify-center mr-3">
                                    <IconWallet className="w-5 h-5 text-white" />
                                </div>
                                <div>
                                    <div className="text-sm text-gray-500 dark:text-gray-400">Remaining Balance</div>
                                    <div className="text-2xl font-bold text-gray-900 dark:text-white">
                                        ₹{totals.totalRemaining.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-green-600 mt-1">
                                        Paid: ₹{totals.totalPaid.toLocaleString('en-IN')}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Data Table */}
                    <div className="datatables">
                        <Table
                            columns={getColumns()}
                            Title={getCategoryTitle()}
                            data={getPaginatedData()}
                            pageSize={pageSize}
                            pageIndex={currentPage}
                            totalCount={currentData.length}
                            totalPages={Math.ceil(currentData.length / pageSize)}
                            onPaginationChange={handlePaginationChange}
                            pagination={true}
                            isSearchable={true}
                            isSortable={true}
                            loading={false}
                        />
                    </div>
                </div>
            </div>

            {/* Details Modal */}
            <ModelViewBox
                modal={showDetailsModal}
                modelHeader={`Salary Details - ${selectedPerson?.name}`}
                isEdit={false}
                setModel={() => setShowDetailsModal(false)}
                handleSubmit={() => setShowDetailsModal(false)}
                modelSize="lg"
                saveBtn={false}
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Basic Information</h6>
                                <div className="space-y-3">
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Name</span>
                                        <span className="font-semibold">{selectedPerson.name}</span>
                                    </div>
                                    <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                        <span className="text-gray-600 dark:text-gray-400">Role</span>
                                        <span className="font-semibold capitalize">{selectedPerson.role}</span>
                                    </div>
                                    
                                    {/* Employee Specific */}
                                    {selectedPerson.role === 'employee' && (
                                        <>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">Daily Salary</span>
                                                <span className="font-semibold">₹{selectedPerson.dailySalary.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">Present Days</span>
                                                <span className="font-semibold">{selectedPerson.presentDays} days</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                                <span className="text-gray-700 dark:text-gray-300">Basic Salary</span>
                                                <span className="font-bold text-blue-600">
                                                    ₹{selectedPerson.basicSalary.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Driver Specific */}
                                    {selectedPerson.role === 'driver' && (
                                        <>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">Daily Salary</span>
                                                <span className="font-semibold">₹{selectedPerson.dailySalary.toLocaleString('en-IN')}</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700">
                                                <span className="text-gray-600 dark:text-gray-400">Present Days</span>
                                                <span className="font-semibold">{selectedPerson.presentDays} days</span>
                                            </div>
                                            <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 bg-blue-50 dark:bg-blue-900/20 p-2 rounded">
                                                <span className="text-gray-700 dark:text-gray-300">Driver Salary</span>
                                                <span className="font-bold text-blue-600">
                                                    ₹{selectedPerson.driverSalary.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </>
                                    )}
                                    
                                    {/* Loadman Specific - NO daily salary */}
                                    {selectedPerson.role === 'loadman' && (
                                        <div className="flex justify-between items-center pb-2 border-b border-gray-200 dark:border-gray-700 bg-purple-50 dark:bg-purple-900/20 p-2 rounded">
                                            <span className="text-gray-700 dark:text-gray-300">Package Based Earnings</span>
                                            <span className="font-bold text-purple-600">
                                                ₹{selectedPerson.packageSalary.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                    )}
                                </div>

                                {/* Show Deductions */}
                                {selectedPerson.deductions.length > 0 && (
                                    <>
                                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4 mt-6">Deductions</h6>
                                        <div className="space-y-2">
                                            {selectedPerson.deductions.map((deduction, index) => (
                                                <div key={deduction.id} className="flex justify-between items-center p-2 bg-red-50 dark:bg-red-900/20 rounded">
                                                    <div>
                                                        <div className="font-medium text-red-700 dark:text-red-400">{deduction.reason}</div>
                                                        <div className="text-xs text-gray-500">{deduction.date}</div>
                                                    </div>
                                                    <div className="font-bold text-red-600">
                                                        - ₹{deduction.amount.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center p-2 bg-red-100 dark:bg-red-900/30 rounded">
                                                <span className="font-semibold">Total Deductions</span>
                                                <span className="font-bold text-red-700">
                                                    - ₹{selectedPerson.totalDeductions.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                                
                                {/* Show Extras */}
                                {selectedPerson.extras.length > 0 && (
                                    <>
                                        <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4 mt-6">Extras</h6>
                                        <div className="space-y-2">
                                            {selectedPerson.extras.map((extra, index) => (
                                                <div key={extra.id} className="flex justify-between items-center p-2 bg-green-50 dark:bg-green-900/20 rounded">
                                                    <div>
                                                        <div className="font-medium text-green-700 dark:text-green-400">{extra.reason}</div>
                                                        <div className="text-xs text-gray-500">{extra.date}</div>
                                                    </div>
                                                    <div className="font-bold text-green-600">
                                                        + ₹{extra.amount.toLocaleString('en-IN')}
                                                    </div>
                                                </div>
                                            ))}
                                            <div className="flex justify-between items-center p-2 bg-green-100 dark:bg-green-900/30 rounded">
                                                <span className="font-semibold">Total Extras</span>
                                                <span className="font-bold text-green-700">
                                                    + ₹{selectedPerson.totalExtras.toLocaleString('en-IN')}
                                                </span>
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div>
                                <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-4">Payment Summary</h6>
                                <div className="space-y-4">
                                    <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                                        <div className="text-lg font-semibold text-green-700 dark:text-green-400 mb-2">Net Salary</div>
                                        <div className="text-2xl font-bold text-green-600">
                                            ₹{selectedPerson.totalSalary.toLocaleString('en-IN')}
                                        </div>
                                        <div className="text-sm text-gray-600 mt-2">
                                            Breakdown:
                                            <div className="mt-1 space-y-1">
                                                {selectedPerson.role === 'employee' && (
                                                    <div className="flex justify-between">
                                                        <span>Basic Salary:</span>
                                                        <span>₹{selectedPerson.basicSalary.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {selectedPerson.role === 'driver' && (
                                                    <div className="flex justify-between">
                                                        <span>Driver Salary:</span>
                                                        <span>₹{selectedPerson.driverSalary.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {selectedPerson.role === 'driver' && selectedPerson.loadmanSalary > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Loadman Salary:</span>
                                                        <span>+ ₹{selectedPerson.loadmanSalary.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {selectedPerson.role === 'loadman' && selectedPerson.packageSalary > 0 && (
                                                    <div className="flex justify-between">
                                                        <span>Package Salary:</span>
                                                        <span>₹{selectedPerson.packageSalary.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {selectedPerson.totalDeductions > 0 && (
                                                    <div className="flex justify-between text-red-600">
                                                        <span>Deductions:</span>
                                                        <span>- ₹{selectedPerson.totalDeductions.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                                {selectedPerson.totalExtras > 0 && (
                                                    <div className="flex justify-between text-green-600">
                                                        <span>Extras:</span>
                                                        <span>+ ₹{selectedPerson.totalExtras.toLocaleString('en-IN')}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Paid Amount</span>
                                            <span className="font-bold text-green-600">
                                                ₹{selectedPerson.paidAmount.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-gray-600 dark:text-gray-400">Remaining Balance</span>
                                            <span className="font-bold text-red-600">
                                                ₹{(selectedPerson.totalSalary - selectedPerson.paidAmount).toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="flex justify-between items-center">
                                            <span className="text-gray-600 dark:text-gray-400">Payment Status</span>
                                            <span className={`font-bold ${selectedPerson.isPaid ? 'text-success' : selectedPerson.paidAmount > 0 ? 'text-warning' : 'text-danger'}`}>
                                                {selectedPerson.isPaid ? 'Fully Paid' : selectedPerson.paidAmount > 0 ? 'Partially Paid' : 'Unpaid'}
                                            </span>
                                        </div>
                                    </div>

                                    {renderWorkDetails()}

                                    {selectedPerson.paymentHistory.length > 0 && (
                                        <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                                            <h6 className="font-medium text-gray-700 dark:text-gray-300 mb-3">Payment History</h6>
                                            <div className="space-y-2 max-h-40 overflow-y-auto">
                                                {selectedPerson.paymentHistory.map((payment, index) => (
                                                    <div key={payment.id} className="flex justify-between items-center p-2 bg-white dark:bg-gray-700 rounded">
                                                        <div>
                                                            <div className="text-sm font-medium">{payment.date}</div>
                                                            <div className="text-xs text-gray-500">{payment.note}</div>
                                                        </div>
                                                        <div className="text-right">
                                                            <div className="font-bold text-green-600">
                                                                ₹{payment.amount.toLocaleString('en-IN')}
                                                            </div>
                                                            {payment.remaining > 0 && (
                                                                <div className="text-xs text-red-600">
                                                                    ₹{payment.remaining.toLocaleString('en-IN')} remaining
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Deduction/Extra Modal */}
            <ModelViewBox
                modal={showDeductionExtraModal}
                modelHeader={`Add ${deductionExtraForm.type === 'deduction' ? 'Deduction' : 'Extra'} - ${selectedPerson?.name}`}
                isEdit={false}
                setModel={() => setShowDeductionExtraModal(false)}
                handleSubmit={addDeductionExtra}
                modelSize="md"
                submitBtnText={`Add ${deductionExtraForm.type === 'deduction' ? 'Deduction' : 'Extra'}`}
                submitBtnClass={deductionExtraForm.type === 'deduction' ? 'btn-danger' : 'btn-success'}
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-bold">
                                    {deductionExtraForm.type === 'deduction' ? 'Add Deduction' : 'Add Extra Allowance'}
                                </div>
                                <div className="text-sm text-gray-500">for {selectedPerson.name}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Type
                                </label>
                                <div className="flex space-x-2">
                                    <button
                                        type="button"
                                        className={`btn ${deductionExtraForm.type === 'deduction' ? 'btn-danger' : 'btn-outline-danger'}`}
                                        onClick={() => setDeductionExtraForm(prev => ({ ...prev, type: 'deduction' }))}
                                    >
                                        <IconMinus className="w-4 h-4 mr-1" />
                                        Deduction
                                    </button>
                                    <button
                                        type="button"
                                        className={`btn ${deductionExtraForm.type === 'extra' ? 'btn-success' : 'btn-outline-success'}`}
                                        onClick={() => setDeductionExtraForm(prev => ({ ...prev, type: 'extra' }))}
                                    >
                                        <IconPlus className="w-4 h-4 mr-1" />
                                        Extra
                                    </button>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="Enter amount"
                                    value={deductionExtraForm.amount}
                                    onChange={handleDeductionExtraFormChange}
                                    min="1"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Reason *
                                </label>
                                <input
                                    type="text"
                                    name="reason"
                                    className="form-input"
                                    placeholder={`Enter reason for ${deductionExtraForm.type}`}
                                    value={deductionExtraForm.reason}
                                    onChange={handleDeductionExtraFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={deductionExtraForm.date}
                                    onChange={handleDeductionExtraFormChange}
                                />
                            </div>

                            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> {deductionExtraForm.type === 'deduction' 
                                        ? 'Deductions will be subtracted from the total salary.'
                                        : 'Extras will be added to the total salary.'}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Loadman Work Modal */}
            <ModelViewBox
                modal={showLoadmanWorkModal}
                modelHeader={`Add Work Record - ${selectedPerson?.name}`}
                isEdit={false}
                setModel={() => setShowLoadmanWorkModal(false)}
                handleSubmit={addLoadmanWork}
                modelSize="md"
                submitBtnText="Add Work Record"
                submitBtnClass="btn-warning"
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-center">
                                <div className="text-lg font-bold">
                                    Add {selectedPerson.role === 'driver' ? 'Loadman' : 'Package'} Work
                                </div>
                                <div className="text-sm text-gray-500">for {selectedPerson.name}</div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Product Type *
                                </label>
                                <select
                                    name="productTypeId"
                                    className="form-select"
                                    value={loadmanWorkForm.productTypeId}
                                    onChange={handleLoadmanWorkFormChange}
                                >
                                    <option value="">Select Product Type</option>
                                    {productTypes.map(product => (
                                        <option key={product.id} value={product.id}>
                                            {product.name} (Pick: ₹{product.pickRate}, Drop: ₹{product.dropRate})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Pick Count *
                                    </label>
                                    <input
                                        type="number"
                                        name="pickCount"
                                        className="form-input"
                                        placeholder="Number picked"
                                        value={loadmanWorkForm.pickCount}
                                        onChange={handleLoadmanWorkFormChange}
                                        min="0"
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                        Drop Count *
                                    </label>
                                    <input
                                        type="number"
                                        name="dropCount"
                                        className="form-input"
                                        placeholder="Number dropped"
                                        value={loadmanWorkForm.dropCount}
                                        onChange={handleLoadmanWorkFormChange}
                                        min="0"
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Date
                                </label>
                                <input
                                    type="date"
                                    name="date"
                                    className="form-input"
                                    value={loadmanWorkForm.date}
                                    onChange={handleLoadmanWorkFormChange}
                                />
                            </div>

                            {loadmanWorkForm.productTypeId && (
                                <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                    <div className="text-sm text-blue-700 dark:text-blue-400">
                                        <div className="font-medium mb-1">Rate Information:</div>
                                        {(() => {
                                            const product = productTypes.find(p => p.id === parseInt(loadmanWorkForm.productTypeId));
                                            if (!product) return null;
                                            
                                            const pickCount = parseInt(loadmanWorkForm.pickCount) || 0;
                                            const dropCount = parseInt(loadmanWorkForm.dropCount) || 0;
                                            const pickAmount = pickCount * product.pickRate;
                                            const dropAmount = dropCount * product.dropRate;
                                            const totalAmount = pickAmount + dropAmount;
                                            
                                            return (
                                                <>
                                                    <div>Product: {product.name}</div>
                                                    <div>Pick Rate: ₹{product.pickRate} per item</div>
                                                    <div>Drop Rate: ₹{product.dropRate} per item</div>
                                                    <div className="mt-2 pt-2 border-t border-blue-200 dark:border-blue-800">
                                                        <div>Pick Amount: {pickCount} × ₹{product.pickRate} = ₹{pickAmount}</div>
                                                        <div>Drop Amount: {dropCount} × ₹{product.dropRate} = ₹{dropAmount}</div>
                                                        <div className="font-bold mt-1">Total: ₹{totalAmount}</div>
                                                    </div>
                                                </>
                                            );
                                        })()}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </ModelViewBox>

            {/* Payment Modal */}
            <ModelViewBox
                modal={showPaymentModal}
                modelHeader={`Process Payment - ${selectedPerson?.name}`}
                isEdit={false}
                setModel={() => setShowPaymentModal(false)}
                handleSubmit={processPayment}
                modelSize="md"
                submitBtnText="Process Payment"
                submitBtnClass="btn-success"
            >
                {selectedPerson && (
                    <div className="p-4">
                        <div className="mb-6 bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                            <div className="text-center mb-4">
                                <div className="text-2xl font-bold text-primary">
                                    ₹{selectedPerson.totalSalary.toLocaleString('en-IN')}
                                </div>
                                <div className="text-sm text-gray-500">Total Salary</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <div className="text-lg font-bold text-green-600">
                                        ₹{selectedPerson.paidAmount.toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500">Already Paid</div>
                                </div>
                                <div className="text-center">
                                    <div className="text-lg font-bold text-red-600">
                                        ₹{(selectedPerson.totalSalary - selectedPerson.paidAmount).toLocaleString('en-IN')}
                                    </div>
                                    <div className="text-xs text-gray-500">Remaining</div>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Amount (₹) *
                                </label>
                                <input
                                    type="number"
                                    name="amount"
                                    className="form-input"
                                    placeholder="Enter amount to pay"
                                    value={paymentForm.amount}
                                    onChange={handlePaymentFormChange}
                                    max={selectedPerson.totalSalary - selectedPerson.paidAmount}
                                    min="1"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                    Maximum: ₹{(selectedPerson.totalSalary - selectedPerson.paidAmount).toLocaleString('en-IN')}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Date *
                                </label>
                                <input
                                    type="date"
                                    name="paymentDate"
                                    className="form-input"
                                    value={paymentForm.paymentDate}
                                    onChange={handlePaymentFormChange}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Payment Note (Optional)
                                </label>
                                <input
                                    type="text"
                                    name="note"
                                    className="form-input"
                                    placeholder="e.g., Bank transfer, Cash payment"
                                    value={paymentForm.note}
                                    onChange={handlePaymentFormChange}
                                />
                            </div>

                            <div className="mt-6 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                                <div className="text-sm text-yellow-700 dark:text-yellow-400">
                                    <strong>Note:</strong> This payment will be recorded and cannot be modified later. Please verify the amount before proceeding.
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </ModelViewBox>
        </div>
    );
};

export default SalaryCalculation;