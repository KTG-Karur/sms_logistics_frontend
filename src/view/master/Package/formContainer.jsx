// formContainer.js
export const FormContainer = [
    {
        formFields: [
            {
                label: 'Auditor ID',
                name: 'auditorId',
                inputType: 'text',
                placeholder: 'Auto-generated ID',
                classStyle: 'col-span-6',
                required: true,
                disabled: true,
            },
            {
                label: 'Full Name',
                name: 'name',
                inputType: 'text',
                placeholder: 'Enter auditor full name',
                classStyle: 'col-span-6',
                required: true,
                validation: {
                    required: 'Name is required',
                    minLength: {
                        value: 2,
                        message: 'Name must be at least 2 characters'
                    }
                }
            },
            {
                label: 'Designation',
                name: 'designation',
                inputType: 'select',
                placeholder: 'Select designation',
                classStyle: 'col-span-6',
                required: true,
                optionList: 'designationList',
                displayKey: 'label',
                uniqueKey: 'value',
                showSelectmodel: true, // This will trigger the button in your FormComponent
                btnName: 'Add Designation', // Button text
            },
            {
                label: 'Enable Authentication',
                name: 'isAuthenticated',
                inputType: 'checkbox',
                classStyle: 'col-span-12',
            },
        ],
    },
];