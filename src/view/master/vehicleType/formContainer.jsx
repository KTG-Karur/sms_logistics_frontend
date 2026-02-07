// Form Container
const FormContainer = [
    {
        formFields: [
            {
                label: 'Vehicle Type Name',
                name: 'vehicleTypeName',
                inputType: 'text',
                placeholder: 'Enter vehicle type name',
                require: true,
                classStyle: 'col-span-12',
                validation: {
                    required: 'Vehicle type name is required',
                    minLength: {
                        value: 2,
                        message: 'Vehicle type name must be at least 2 characters'
                    },
                    maxLength: {
                        value: 100,
                        message: 'Vehicle type name must be less than 100 characters'
                    }
                }
            },
        ],
    },
];

export { FormContainer };