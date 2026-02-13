// Form Container for Office Centers
const FormContainer = [
    {
        formFields: [
            {
                label: 'Office Center Name',
                name: 'officeCenterName',
                inputType: 'text',
                placeholder: 'Enter office center name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Office center name is required',
                    minLength: {
                        value: 2,
                        message: 'Office center name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Office center name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };