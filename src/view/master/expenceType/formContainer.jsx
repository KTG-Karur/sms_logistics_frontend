// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Expence Type Name',
                name: 'expenceTypeName',
                inputType: 'text',
                placeholder: 'Enter expence type name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Expence type name is required',
                    minLength: {
                        value: 2,
                        message: 'Expence type name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Expence type name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };