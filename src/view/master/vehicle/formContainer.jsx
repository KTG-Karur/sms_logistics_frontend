// formContainer.js
export const FormContainer = [
    {
        formFields: [
            {
                label: 'Title',
                name: 'title',
                inputType: 'text',
                placeholder: 'Enter checklist title',
                classStyle: 'col-span-12',
                required: true,
                validation: {
                    required: 'Title is required',
                    minLength: {
                        value: 3,
                        message: 'Title must be at least 3 characters'
                    }
                }
            }
        ]
    }
];