const employeeFormContainer = [
    {
        formFields: [
            {
                label: 'Name',
                name: 'companyName',
                inputType: 'text',
                placeholder: 'Enter Company Name',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'Mobile',
                name: 'companyMobile',
                inputType: 'number',
                placeholder: 'Enter Company Mobile',
                maxlength: '10',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'Alt Mobile',
                name: 'companyAltMobile',
                inputType: 'number',
                placeholder: 'Enter Company Alternative Mobile',
                maxlength: '10',
                classStyle: 'col-span-3',
            },
            {
                label: 'Mail',
                name: 'companyMail',
                placeholder: 'Enter Company Mail',
                inputType: 'email',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'GST No',
                name: 'companyGstNo',
                placeholder: 'Enter Company GST No',
                inputType: 'text',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'Address Line One',
                name: 'companyAddressOne',
                inputType: 'textarea',
                rows: '1',
                placeholder: 'Enter Company Address',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'Address Line Two',
                name: 'companyAddressTwo',
                inputType: 'textarea',
                rows: '1',
                placeholder: 'Enter Company Address',
                classStyle: 'col-span-3',
            },
            {
                label: 'Logo',
                name: 'companyLogo',
                inputType: 'file',
                classStyle: 'col-span-3',
                onChange: 'formImage',
                accept: 'image/*',
            },
        ],
    },
    {
        formFields: [
            {
                title: 'Authentication',
                inputType: 'title',
                classStyle: 'col-span-12 mb-2 mt-3',
            },
            {
                label: 'User Name (Super Admin)',
                name: 'userName',
                inputType: 'text',
                placeholder: 'Enter User Name (Admin)',
                require: true,
                classStyle: 'col-span-3',
            },
            {
                label: 'Password (Super Admin)',
                name: 'password',
                inputType: 'password',
                placeholder: 'Enter Password (Admin)',
                require: true,
                classStyle: 'col-span-3',
            },
        ],
    },
    {
        formFields: [
            {
                label: 'Update',
                inputType: 'button',
                onClick: 'formUpdate',
                justifyContent: 'end',
                variant: 'info',
            },
        ],
    },
];

export { employeeFormContainer };