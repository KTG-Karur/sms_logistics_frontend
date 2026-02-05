// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Designation Name',
                name: 'designationName',
                inputType: 'text',
                placeholder: 'Enter designation name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Designation name is required',
                    minLength: {
                        value: 2,
                        message: 'Designation name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Designation name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };