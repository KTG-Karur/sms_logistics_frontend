import React, { Suspense } from 'react';
import PrivateRoute from './PrivateRoute';
import Root from './Root';
import { useRoutes } from 'react-router-dom';
import DefaultLayout from '../components/Layouts/DefaultLayout';

import {
    Index,
    Employee,
    Role,
    CompanyInfo,
    SubChecklistAudit,
    SubChecklistSupplier,
    AuditForm,
    //new asf - ev
    Auditor,
    //new VMS
    ChecklistAudit,
    ChecklistSupplier,
    Staff,
    Department,
    Designation,
    //old
    ContactUsBoxed,
    ContactUsCover,
    ComingSoonBoxed,
    ComingSoonCover,
    ERROR404,
    ERROR500,
    ERROR503,
    Maintenence,
    LoginBoxed,
    Audit,
    Capa,
    Suppliers,
    PdfSubAuditChecklist,
    AuditReport,
    AuditAssignToAuditor,
    AuditFormPdf,
    AuditReSchedule,
    PdfSubAuditChecklistBarChart,
    PdfSubAuditChecklistImages,
    AuditReportPdf,
    AuditorReport,
} from './Route_Menu';
import path from 'path';

const loading = () => <div className=""></div>;

type LoadComponentProps = {
    component: React.LazyExoticComponent<() => JSX.Element>;
};

const LoadComponent = ({ component: Component }: LoadComponentProps) => (
    <Suspense fallback={loading()}>
        <Component />
    </Suspense>
);

// const AllRoutes = () => {
//     const { appSelector } = useRedux();

//     const { layout } = appSelector((state) => ({
//         layout: state.Layout,
//     }));

//     const getLayout = () => {
//         let layoutCls: React.ComponentType = VerticalLayout;

//         switch (layout.layoutType) {
//             case LayoutTypes.LAYOUT_HORIZONTAL:
//                 layoutCls = defaultLayout;
//                 break;
//             default:
//                 layoutCls = VerticalLayout;
//                 break;
//         }
//         return layoutCls;
//     };
//     let Layout = getLayout();
//     return useRoutes([
//         { path: '/', element: <Root /> },
//         {
//             path: 'error-404',
//             element: <LoadComponent component={Error404} />,
//         },
//         {
//             path: 'error-500',
//             element: <LoadComponent component={Error500} />,
//         },
//         {
//             // public routes
//             path: '/',
//             element: <DefaultLayout />,
//             children: [
//                 {
//                     path: 'auth',
//                     children: [
//                         { path: 'login', element: <LoadComponent component={Login} /> },
//                         { path: 'register', element: <LoadComponent component={Register} /> },
//                         { path: 'confirm', element: <LoadComponent component={Confirm} /> },
//                         { path: 'forget-password', element: <LoadComponent component={ForgetPassword} /> },
//                         { path: 'lock-screen', element: <LoadComponent component={LockScreen} /> },
//                         { path: 'logout', element: <LoadComponent component={Logout} /> },
//                     ],
//                 },
//                 {
//                     path: 'maintenance',
//                     element: <LoadComponent component={Maintenance} />,
//                 },
//                 {
//                     path: 'coming-soon',
//                     element: <LoadComponent component={ComingSoon} />,
//                 },
//                 {
//                     path: 'landing',
//                     element: <LoadComponent component={Landing} />,
//                 },
//             ],
//         },
//         {
//             // auth protected routes
//             path: '/',
//             element: <PrivateRoute component={Layout} />,
//             children: [
//                 {
//                     path: '*',
//                     element: <LoadComponent component={Error404} />,
//                 },
//                 {
//                     path: 'dashboard',
//                     element: <LoadComponent component={DashBoard} />,
//                 },
//                 {
//                     path: 'feathericons',
//                     element: <LoadComponent component={FeatherIcons} />,
//                 },
//                 {
//                     path: 'report',
//                     children: [
//                         {
//                             path: 'order-history',
//                             element: <LoadComponent component={orderHistory} />,
//                         },
//                         {
//                             path: 'print-tag',
//                             element: <LoadComponent component={printTag} />,
//                         },
//                         {
//                             path: 'print-estimate',
//                             element: <LoadComponent component={printEstimate} />,
//                         },
//                         {
//                             path: 'order-report',
//                             element: <LoadComponent component={orderReport} />,
//                         },
//                         {
//                             path: 'revenue-report',
//                             element: <LoadComponent component={revenueReport} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'settings',
//                     children: [
//                         {
//                             path: 'company-info',
//                             element: <LoadComponent component={companiInfo} />,
//                         },
//                         {
//                             path: 'role',
//                             element: <LoadComponent component={Role} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'order',
//                     children: [
//                         {
//                             path: 'pickup-orders',
//                             element: <LoadComponent component={PickupOrder} />,
//                         },
//                         {
//                             path: 'create-order',
//                             element: <LoadComponent component={Createorder} />,
//                         },
//                         {
//                             path: 'manage-orders',
//                             element: <LoadComponent component={manageorder} />,
//                         },
//                         {
//                             path: 'payment',
//                             element: <LoadComponent component={payment} />,
//                         },
//                         {
//                             path: 'online-deliveries',
//                             element: <LoadComponent component={Deliveries} />,
//                         },
//                         {
//                             path: 'walkin-deliveries',
//                             element: <LoadComponent component={WalkinDeliveries} />,
//                         },
//                     ],
//                 },
//                 {
//                     path: 'master',
//                     children: [
//                         {
//                             path: 'designation',
//                             element: <LoadComponent component={Designation} />,
//                         },
//                         {
//                             path: 'staff',
//                             element: <LoadComponent component={Staff} />,
//                         },
//                         {
//                             path: 'service-type',
//                             element: <LoadComponent component={ServiceType} />,
//                         },
//                         {
//                             path: 'Checklist',
//                             element: <LoadComponent component={Checklist} />,
//                         },
//                         {
//                             path: 'customer',
//                             element: <LoadComponent component={customer} />,
//                         },
//                     ],
//                 },
//             ],
//         },
//     ]);
// };

// export { AllRoutes };

const routes = [
    // dashboard
    {
        path: '/',
        element: <Index />,
    },
    //new asf ev
    {
        path: '/master/auditor',
        element: <Auditor />,
    },
    {
        path: '/audit/external-provider/form',
        element: <AuditForm />,
    },
    {
        path: '/master/sub-checklist-audit',
        element: <SubChecklistAudit />,
    },
    {
        path: '/master/checklist-audit',
        element: <ChecklistAudit />,
    },
    {
        path: '/master/sub-checklist-supplier',
        element: <SubChecklistSupplier />,
    },
    {
        path: '/master/checklist-supplier',
        element: <ChecklistSupplier />,
    },
    {
        path: '/reports/audit-report',
        element: <AuditReport />,
    },
    {
        path: '/reports/auditor-report',
        element: <AuditorReport />,
    },
    //old
    {
        path: '/master/staff',
        element: <Staff />,
    },
    {
        path: '/master/department',
        element: <Department />,
    },
    {
        path: '/master/designation',
        element: <Designation />,
    },
    {
        path: '/master/audit-assign-to-auditor',
        element: <AuditAssignToAuditor />,
    },
    {
        path: '/master/suppliers',
        element: <Suppliers />,
    },
    {
        path: '/audit/external-provider',
        element: <Audit />,
    },
    {
     path: '/capa',
     element : <Capa />,
    },
    //old
    {
        path: '/master/employee',
        element: <Employee />,
    },
    {
        path: '/master/role',
        element: <Role />,
    },
    //new VMS public
    {
        path: '/settings/company-info',
        element: <CompanyInfo />,
    },
    {
        path: '/documents/print-sub-checklist-sub-audit',
        element: <PdfSubAuditChecklist />,
    },
    {
        path: '/documents/print-sub-checklist-sub-audit-bar-chart',
        element: <PdfSubAuditChecklistBarChart />,
    },
    {
        path: '/documents/print-sub-checklist-sub-audit-images',
        element: <PdfSubAuditChecklistImages />,
    },
    {
        path: '/documents/audit-report-pdf',
        element: <AuditReportPdf />,
    },
    // pages

    {
        path: '/pages/contact-us-boxed',
        element: <ContactUsBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/contact-us-cover',
        element: <ContactUsCover />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-boxed',
        element: <ComingSoonBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-cover',
        element: <ComingSoonCover />,
        layout: 'blank',
    },
    {
        path: '/pages/error404',
        element: <ERROR404 />,
        layout: 'blank',
    },
    {
        path: '/pages/error500',
        element: <ERROR500 />,
        layout: 'blank',
    },
    {
        path: '/pages/error503',
        element: <ERROR503 />,
        layout: 'blank',
    },
    {
        path: '/pages/maintenence',
        element: <Maintenence />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <ERROR404 />,
        layout: 'blank',
    },
    //Authentication
    {
        path: '/auth/boxed-signin',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/audit/report-pdf',
        element: <AuditFormPdf />,
    },
    {
        path: '/audit/re-schedule',
        element: <AuditReSchedule />,
    },
];

const dontCkeckRouts = [
    //new VMS
    {
        path: '/master/sub-checklist-audit',
        element: <SubChecklistAudit />,
    },
    {
        path: '/master/sub-checklist-supplier',
        element: <SubChecklistSupplier />,
    },
    {
        path: '/audit/external-provider/form',
        element: <AuditForm />,
    },
    //old
    {
        path: '/documents/print-sub-checklist-sub-audit-bar-chart',
        element: <PdfSubAuditChecklistBarChart />,
    },
    {
        path: '/documents/print-sub-checklist-sub-audit',
        element: <PdfSubAuditChecklist />,
    },
    {
        path: '/documents/print-sub-checklist-sub-audit-images',
        element: <PdfSubAuditChecklistImages />,
    },
    {
        path: '/documents/audit-report-pdf',
        element: <AuditReportPdf />,
    },
    {
        path: '/pages/contact-us-boxed',
        element: <ContactUsBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/contact-us-cover',
        element: <ContactUsCover />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-boxed',
        element: <ComingSoonBoxed />,
        layout: 'blank',
    },
    {
        path: '/pages/coming-soon-cover',
        element: <ComingSoonCover />,
        layout: 'blank',
    },
    {
        path: '/pages/error404',
        element: <ERROR404 />,
        layout: 'blank',
    },
    {
        path: '/pages/error500',
        element: <ERROR500 />,
        layout: 'blank',
    },
    {
        path: '/pages/error503',
        element: <ERROR503 />,
        layout: 'blank',
    },
    {
        path: '/pages/maintenence',
        element: <Maintenence />,
        layout: 'blank',
    },
    {
        path: '*',
        element: <ERROR404 />,
        layout: 'blank',
    },
    //Authentication
    {
        path: '/auth/boxed-signin',
        element: <LoginBoxed />,
        layout: 'blank',
    },
    {
        path: '/audit/report-pdf',
        element: <AuditFormPdf />,
    },
];

export { routes, dontCkeckRouts };
