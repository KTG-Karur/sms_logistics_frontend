// src/pages/suppliers/formContainer.jsx
import React from 'react';

// Icons
import IconFactory from '../../../components/Icon/IconBuilding';
import IconTools from '../../../components/Icon/IconCpuBolt';
import IconChecklist from '../../../components/Icon/IconChecks';
import IconShield from '../../../components/Icon/IconShield';
import IconScale from '../../../components/Icon/IconChartBar';
import IconDocument from '../../../components/Icon/IconFile';
import IconUser from '../../../components/Icon/IconUser';
import IconBank from '../../../components/Icon/IconCreditCard';
import IconClock from '../../../components/Icon/IconClock';
import IconLicense from '../../../components/Icon/IconFile';
import IconClipboardList from '../../../components/Icon/IconChartBar';

// Modern responsive grid configuration
const getModernGrid = (cols) => {
    return {
        base: 'grid-cols-1',
        sm: 'sm:grid-cols-2',
        md: `md:grid-cols-${Math.min(cols, 2)}`,
        lg: `lg:grid-cols-${Math.min(cols, 3)}`,
        xl: `xl:grid-cols-${cols}`,
    };
};

// Helper function for responsive classes
const responsiveClass = (breakpoints) => {
    return Object.values(breakpoints).join(' ');
};

// Modern Supplier Tabs Configuration
const supplierTabs = [
    {
        label: 'Supplier Basic Info',
        name: 'supplierBasicInfo',
        icon: <IconFactory className="w-5 h-5 text-blue-600" />,
        iconColor: 'blue',
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'Factory & Contact Information',
                subtitle: 'Complete factory details and location information',
                formFields: [
                    {
                        label: 'Name of the Supplier',
                        name: 'supplier_name',
                        inputType: 'text',
                        placeholder: 'Enter full supplier/company name',
                        require: true,
                        classStyle: 'col-span-2',
                    },
                    {
                        label: 'Factory Address',
                        name: 'factory_address',
                        inputType: 'textarea',
                        placeholder: 'Complete factory address',
                        require: true,
                        rows: 3,
                        classStyle: 'col-span-2',
                    },
                    {
                        label: 'Panchayat',
                        name: 'panchayat',
                        inputType: 'text',
                        placeholder: 'Panchayat name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Post Office',
                        name: 'post_office',
                        inputType: 'text',
                        placeholder: 'Post office name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Police Station',
                        name: 'police_station',
                        inputType: 'text',
                        placeholder: 'Police station name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'District',
                        name: 'district',
                        inputType: 'text',
                        placeholder: 'District name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'State/Province',
                        name: 'state_province',
                        inputType: 'text',
                        placeholder: 'State or province',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Region',
                        name: 'region',
                        inputType: 'text',
                        placeholder: 'Region',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Post/Zip Code',
                        name: 'postal_code',
                        inputType: 'text',
                        placeholder: 'Postal/ZIP code',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Phone',
                        name: 'phone',
                        inputType: 'text',
                        placeholder: 'Phone number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Landmark',
                        name: 'landmark',
                        inputType: 'text',
                        placeholder: 'Nearest landmark',
                        require: false,
                        classStyle: 'col-span-2',
                    },
                    {
                        label: 'Email',
                        name: 'email',
                        inputType: 'email',
                        placeholder: 'official@email.com',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Year of Establishment',
                        name: 'year_of_establishment',
                        inputType: 'number',
                        placeholder: 'YYYY',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Website',
                        name: 'website',
                        inputType: 'text',
                        placeholder: 'https://www.example.com',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'GPS Latitude',
                        name: 'gps_latitude',
                        inputType: 'text',
                        placeholder: 'e.g., 12.9716',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'GPS Longitude',
                        name: 'gps_longitude',
                        inputType: 'text',
                        placeholder: 'e.g., 77.5946',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                ],
            },
        ],
    },
    {
        label: 'Responsible Person',
        name: 'responsiblePerson',
        icon: <IconUser className="w-5 h-5 text-purple-600" />,
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'Contact Person Details',
                subtitle: 'Primary contact person information',
                formFields: [
                    {
                        label: 'Name of Responsible Person',
                        name: 'responsible_person_name',
                        inputType: 'text',
                        placeholder: 'Full name of responsible person',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Designation',
                        name: 'designation',
                        inputType: 'text',
                        placeholder: 'Position in company',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: "Father's Name",
                        name: 'father_name',
                        inputType: 'text',
                        placeholder: "Father's name",
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Contact Number (Mobile)',
                        name: 'mobile_number',
                        inputType: 'text',
                        placeholder: '10-digit mobile number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Landline (Optional)',
                        name: 'landline',
                        inputType: 'text',
                        placeholder: 'Landline with STD code',
                        require: false,
                        classStyle: 'col-span-2',
                    },
                ],
            },
        ],
    },
    {
        label: 'Accounts Details',
        name: 'accountsDetails',
        icon: <IconBank className="w-5 h-5 text-emerald-600" />,
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'Bank & Financial Information',
                subtitle: 'Financial and registration details',
                formFields: [
                    {
                        label: 'Account Name',
                        name: 'account_name',
                        inputType: 'text',
                        placeholder: 'Bank account holder name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Bank & Place',
                        name: 'bank_and_place',
                        inputType: 'text',
                        placeholder: 'Bank name and branch location',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'A/C Number',
                        name: 'account_number',
                        inputType: 'text',
                        placeholder: 'Bank account number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'IFSC/MICR Code',
                        name: 'ifsc_micr',
                        inputType: 'text',
                        placeholder: 'IFSC or MICR code',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'GSTIN Number',
                        name: 'gstin_number',
                        inputType: 'text',
                        placeholder: 'GST Identification Number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'CIN Number',
                        name: 'cin_number',
                        inputType: 'text',
                        placeholder: 'Corporate Identification Number',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'PAN Number',
                        name: 'pan_number',
                        inputType: 'text',
                        placeholder: 'Permanent Account Number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'TAN Number',
                        name: 'tan_number',
                        inputType: 'text',
                        placeholder: 'Tax Deduction Account Number',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Annual Turnover (₹)',
                        name: 'annual_turnover',
                        inputType: 'number',
                        placeholder: 'Annual turnover in rupees',
                        require: true,
                        classStyle: 'col-span-1',
                        min: 0,
                    },
                    {
                        label: 'Business Start Date with ASIAN',
                        name: 'business_start_date',
                        inputType: 'date',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Factory Owner Name',
                        name: 'factory_owner_name',
                        inputType: 'text',
                        placeholder: 'Owner/Director name',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Ownership Type',
                        name: 'ownership_type',
                        inputType: 'select',
                        optionList: 'ownershipTypes',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Name of Joint Venture',
                        name: 'joint_venture_name',
                        inputType: 'text',
                        placeholder: 'If applicable',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.ownership_type === 'joint_venture',
                    },
                    {
                        label: 'Direct Business with Customers',
                        name: 'direct_business',
                        inputType: 'checkbox',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Customer Names (if any)',
                        name: 'customer_names',
                        inputType: 'textarea',
                        placeholder: 'List major customers if direct business',
                        require: false,
                        rows: 2,
                        classStyle: 'col-span-2',
                        condition: (state) => state.direct_business,
                    },
                ],
            },
        ],
    },
    {
        label: 'Machinery Details',
        name: 'machineryDetails',
        icon: <IconTools className="w-5 h-5 text-amber-600" />,
        accordianStyle: responsiveClass(getModernGrid(1)),
        children: [
            {
                title: 'Details of Machinery',
                subtitle: 'Add multiple machinery entries',
                formFields: [],
            },
        ],
    },
    {
        label: 'Production Capacity',
        name: 'productionCapacity',
        icon: <IconFactory className="w-5 h-5 text-blue-600" />,
        accordianStyle: responsiveClass(getModernGrid(1)),
        children: [
            {
                title: 'Article-wise Capacity',
                subtitle: 'Production capacity details',
                formFields: [],
            },
        ],
    },
    {
        label: 'Man Power',
        name: 'manPower',
        icon: <IconUser className="w-5 h-5 text-indigo-600" />,
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'Manpower Details',
                subtitle: 'Employee distribution by category',
                formFields: [
                    {
                        label: 'Average Wages Paid Per Month (₹)',
                        name: 'average_wages_per_month',
                        inputType: 'number',
                        placeholder: 'Average monthly wages per employee',
                        require: true,
                        classStyle: 'col-span-1',
                        min: 0,
                    },
                    {
                        label: 'Accident Insurance Number',
                        name: 'accident_insurance_number',
                        inputType: 'text',
                        placeholder: 'Insurance policy number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Validity Upto Date',
                        name: 'insurance_validity_date',
                        inputType: 'date',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                ],
            },
        ],
    },
    {
        label: 'Working Hours',
        name: 'workingHours',
        icon: <IconClock className="w-5 h-5 text-purple-600" />,
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'Shift Details',
                subtitle: 'Working hours and shift information',
                formFields: [
                    {
                        label: 'Number of Shifts',
                        name: 'number_of_shifts',
                        inputType: 'select',
                        optionList: 'shiftOptions',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: '1st Shift Start Time',
                        name: 'shift_1_start',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 1,
                    },
                    {
                        label: '1st Shift End Time',
                        name: 'shift_1_end',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 1,
                    },
                    {
                        label: '2nd Shift Start Time',
                        name: 'shift_2_start',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 2,
                    },
                    {
                        label: '2nd Shift End Time',
                        name: 'shift_2_end',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 2,
                    },
                    {
                        label: '3rd Shift Start Time',
                        name: 'shift_3_start',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 3,
                    },
                    {
                        label: '3rd Shift End Time',
                        name: 'shift_3_end',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.number_of_shifts >= 3,
                    },
                    {
                        label: 'General Shift Start Time',
                        name: 'general_shift_start',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'General Shift End Time',
                        name: 'general_shift_end',
                        inputType: 'time',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Week Off Day',
                        name: 'week_off_day',
                        inputType: 'text',
                        placeholder: 'e.g., Sunday, Saturday, etc.',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Max No of OT Hours per Week',
                        name: 'max_ot_hours_per_week',
                        inputType: 'number',
                        placeholder: 'Maximum overtime hours',
                        require: false,
                        classStyle: 'col-span-1',
                        min: 0,
                    },
                ],
            },
        ],
    },
    {
        label: 'License Details',
        name: 'licenseDetails',
        icon: <IconLicense className="w-5 h-5 text-red-600" />,
        accordianStyle: responsiveClass(getModernGrid(2)),
        children: [
            {
                title: 'License & Registration Information',
                subtitle: 'Factory licenses and compliance documents',
                formFields: [
                    {
                        label: 'Factory License Number',
                        name: 'factory_license_number',
                        inputType: 'text',
                        placeholder: 'Factory license number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Validity Upto Date',
                        name: 'factory_license_validity',
                        inputType: 'date',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'PF Number',
                        name: 'pf_number',
                        inputType: 'text',
                        placeholder: 'Provident Fund number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Last PF Challan Paid Date',
                        name: 'last_pf_challan_paid',
                        inputType: 'date',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'ESI Number',
                        name: 'esi_number',
                        inputType: 'text',
                        placeholder: 'Employee State Insurance number',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Last ESI Challan Paid Date',
                        name: 'last_esi_challan_paid',
                        inputType: 'date',
                        require: true,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'TNPCB Air Consent Number',
                        name: 'tnpcb_air_consent',
                        inputType: 'text',
                        placeholder: 'Air consent number',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Validity Upto Date',
                        name: 'tnpcb_air_validity',
                        inputType: 'date',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.tnpcb_air_consent,
                    },
                    {
                        label: 'TNPCB Water Consent Number',
                        name: 'tnpcb_water_consent',
                        inputType: 'text',
                        placeholder: 'Water consent number',
                        require: false,
                        classStyle: 'col-span-1',
                    },
                    {
                        label: 'Validity Upto Date',
                        name: 'tnpcb_water_validity',
                        inputType: 'date',
                        require: false,
                        classStyle: 'col-span-1',
                        condition: (state) => state.tnpcb_water_consent,
                    },
                ],
            },
        ],
    },
    {
        label: 'Customer Standards',
        name: 'customerStandards',
        icon: <IconShield className="w-5 h-5 text-blue-600" />,
        accordianStyle: responsiveClass(getModernGrid(1)),
        children: [
            {
                title: 'List of Customer Standards Communicated',
                subtitle: 'Select from master list and fill acceptance details',
                formFields: [
                    {
                        label: 'Customer Standards Selection',
                        name: 'selected_standards',
                        inputType: 'standardSelection',
                        placeholder: 'Select standards from master list',
                        require: false,
                        classStyle: 'col-span-2',
                    },
                ],
            },
        ],
    },
    {
        label: 'Self Assessment',
        name: 'selfAssessment',
        icon: <IconClipboardList className="w-5 h-5 text-emerald-600" />,
        accordianStyle: responsiveClass(getModernGrid(1)),
        children: [
            {
                title: 'Supplier General Self Assessment',
                subtitle: 'Self-assessment checklist for supplier compliance',
                formFields: [
                    {
                        label: 'Self Assessment Items',
                        name: 'self_assessment_items',
                        inputType: 'assessmentSelection',
                        placeholder: 'Select and fill self-assessment items',
                        require: false,
                        classStyle: 'col-span-2',
                    },
                ],
            },
        ],
    },
];

// Enhanced option lists with categories
const optionLists = {
    ownershipTypes: [
        { value: 'fully_owned', label: 'Fully Owned' },
        { value: 'joint_venture', label: 'Joint Venture' },
        { value: 'partnership', label: 'Partnership' },
        { value: 'private_limited', label: 'Private Limited' },
        { value: 'proprietorship', label: 'Proprietorship' },
    ],

    shiftOptions: [
        { value: '1', label: '1 Shift' },
        { value: '2', label: '2 Shifts' },
        { value: '3', label: '3 Shifts' },
        { value: '0', label: 'General Shift Only' },
    ],

    capacityUnits: [
        { value: 'kg', label: 'Kilograms (KG)' },
        { value: 'meters', label: 'Meters (Mtrs)' },
        { value: 'pcs', label: 'Pieces (Pcs)' },
        { value: 'units', label: 'Units' },
        { value: 'tons', label: 'Tons' },
    ],

    weekDays: [
        { value: 'sunday', label: 'Sunday' },
        { value: 'monday', label: 'Monday' },
        { value: 'tuesday', label: 'Tuesday' },
        { value: 'wednesday', label: 'Wednesday' },
        { value: 'thursday', label: 'Thursday' },
        { value: 'friday', label: 'Friday' },
        { value: 'saturday', label: 'Saturday' },
    ],

    yesNoOptions: [
        { value: 'yes', label: 'Yes' },
        { value: 'no', label: 'No' },
    ],

    customerTypes: [
        { value: 'ASIAN', label: 'ASIAN' },
        { value: 'Other', label: 'Other' },
    ],

    statusOptions: [
        { value: 'pending', label: 'Pending' },
        { value: 'accepted', label: 'Accepted' },
        { value: 'rejected', label: 'Rejected' },
    ],
};

// Mock data for standards from master
const masterStandards = [
    { id: 1, name: 'IWAY Standard 6.0', version: '6.0', description: 'IKEA Way on Social and Environmental Responsibility' },
    { id: 2, name: 'BSCI Code of Conduct', version: '2.0', description: 'Business Social Compliance Initiative' },
    { id: 3, name: 'Sedex Members Ethical Trade Audit', version: '6.0', description: 'Supplier Ethical Data Exchange' },
    { id: 4, name: 'WRAP Certification', version: '12.0', description: 'Worldwide Responsible Accredited Production' },
    { id: 5, name: 'ISO 9001:2015', version: '2015', description: 'Quality Management Systems' },
    { id: 6, name: 'ISO 14001:2015', version: '2015', description: 'Environmental Management Systems' },
    { id: 7, name: 'OHSAS 18001', version: '2007', description: 'Occupational Health and Safety' },
    { id: 8, name: 'SA8000:2014', version: '2014', description: 'Social Accountability' },
];

// Mock data for assessment items from master
const masterAssessmentItems = [
    { id: 1, particulars: 'Factory has proper fire safety equipment', category: 'Safety' },
    { id: 2, particulars: 'Emergency exits are clearly marked and accessible', category: 'Safety' },
    { id: 3, particulars: 'First aid kits available and accessible', category: 'Safety' },
    { id: 4, particulars: 'All employees have proper PPE', category: 'Safety' },
    { id: 5, particulars: 'Factory maintains proper ventilation', category: 'Health' },
    { id: 6, particulars: 'Drinking water available for all employees', category: 'Health' },
    { id: 7, particulars: 'Clean and hygienic toilets available', category: 'Health' },
    { id: 8, particulars: 'No child labor employed', category: 'Labor' },
    { id: 9, particulars: 'No forced labor employed', category: 'Labor' },
    { id: 10, particulars: 'Minimum wage compliance', category: 'Labor' },
    { id: 11, particulars: 'Proper working hours maintained', category: 'Labor' },
    { id: 12, particulars: 'Overtime is voluntary and paid properly', category: 'Labor' },
    { id: 13, particulars: 'Anti-discrimination policy in place', category: 'Policy' },
    { id: 14, particulars: 'Grievance mechanism available', category: 'Policy' },
    { id: 15, particulars: 'Environmental compliance certificates', category: 'Environment' },
    { id: 16, particulars: 'Waste management system in place', category: 'Environment' },
];

// Modern static supplier data
const staticSuppliersData = [
    {
        id: 1,
        supplier_id: 'SUP-001',
        supplier_name: 'Asian Fabrics Private Limited',
        factory_address: '54, L.B.4, N23AY, KAYAY',
        panchayat: 'Kayay Panchayat',
        post_office: 'Kayay PO',
        police_station: 'Kayay Police Station',
        district: 'Tirupur',
        state_province: 'Tamil Nadu',
        region: 'South India',
        postal_code: '600001',
        phone: '7800000156',
        landmark: 'Near Textile Park',
        email: 'info@asianfabrics.com',
        website: 'www.asianfabrics.com',
        year_of_establishment: 2005,
        responsible_person_name: 'Key Blazer',
        designation: 'General Manager',
        father_name: 'John Blazer',
        mobile_number: '7800000156',
        account_name: 'Asian Fabrics Pvt Ltd',
        bank_and_place: 'State Bank of India, Kayay Branch',
        account_number: '123456789012',
        ifsc_micr: 'SBIN0001234',
        gstin_number: '33AAECA1234A1Z5',
        cin_number: 'U17110TN2005PTC056789',
        pan_number: 'AAECA1234A',
        tan_number: 'CHNA12345A',
        annual_turnover: 50000000,
        business_start_date: '2020-01-15',
        factory_owner_name: 'John Doe',
        ownership_type: 'private_limited',
        status: 'active',
        kyc_status: 'verified',
        last_audit_date: '2025-12-15',
        next_audit_date: '2026-06-15',
        branch_name: 'Main Branch',
        branch_id: 'BR-001',
        customer_standards: [
            { id: 1, standard_id: 1, standard_name: 'IWAY Standard 6.0', customer_type: 'ASIAN', acceptance_date: '2024-01-15', status: 'accepted', version: '6.0' },
            { id: 2, standard_id: 2, standard_name: 'BSCI Code of Conduct', customer_type: 'Other', customer_name: 'Brand X', acceptance_date: '2024-02-20', status: 'pending', version: '2.0' },
        ],
        self_assessment: [
            { id: 1, item_id: 1, particulars: 'Factory has proper fire safety equipment', details: 'All fire extinguishers are checked monthly', status: 'yes' },
            { id: 2, item_id: 2, particulars: 'Emergency exits are clearly marked and accessible', details: 'Exits marked with glow signs', status: 'yes' },
            { id: 3, item_id: 8, particulars: 'No child labor employed', details: 'All employees above 18 years', status: 'yes' },
        ],
    },
];

// Badge styling functions
const getStatusBadge = (status) => {
    const badges = {
        active: {
            text: 'Active',
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        inactive: {
            text: 'Inactive',
            color: 'bg-gray-100 text-gray-800 border-gray-200',
        },
        pending: {
            text: 'Pending',
            color: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        suspended: {
            text: 'Suspended',
            color: 'bg-rose-100 text-rose-800 border-rose-200',
        },
    };
    return badges[status] || badges.inactive;
};

const getKycBadge = (status) => {
    const badges = {
        verified: {
            text: 'Verified',
            color: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        },
        pending: {
            text: 'Pending',
            color: 'bg-amber-100 text-amber-800 border-amber-200',
        },
        rejected: {
            text: 'Rejected',
            color: 'bg-rose-100 text-rose-800 border-rose-200',
        },
        in_progress: {
            text: 'In Progress',
            color: 'bg-blue-100 text-blue-800 border-blue-200',
        },
    };
    return badges[status] || badges.pending;
};

const getAuditBadge = (score) => {
    if (score >= 90) return { text: 'Excellent', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' };
    if (score >= 80) return { text: 'Good', color: 'bg-blue-100 text-blue-800 border-blue-200' };
    if (score >= 70) return { text: 'Fair', color: 'bg-amber-100 text-amber-800 border-amber-200' };
    return { text: 'Poor', color: 'bg-rose-100 text-rose-800 border-rose-200' };
};

export { supplierTabs, optionLists, masterStandards, masterAssessmentItems, staticSuppliersData, getStatusBadge, getKycBadge, getAuditBadge };
