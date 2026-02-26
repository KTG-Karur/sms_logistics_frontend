import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import FormLayout from '../../util/formLayout';
import { useDispatch, useSelector } from 'react-redux';
import { employeeFormContainer } from './formFieldData';
import { findArrObj, showMessage , getAccessIdsByLabel } from '../../util/AllFunction';
import { getCompany, resetCompanyStatus, updateCompany } from '../../redux/companySlice';
import moment from 'moment';
import { baseURL } from '../../api/ApiConfig';
import { createUplode, resetUplodeStatus } from '../../redux/uplodeSlice';
import _ from 'lodash';

let isEdit = false;

function Index() {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Company Info');
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    const { getCompanySuccess, companyData, getCompanyFailed, updateCompanySuccess, updateCompanyFailed, errorMessage } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice.getCompanySuccess,
        companyData: state.ComapnySlice.companyData,
        getCompanyFailed: state.ComapnySlice.getCompanyFailed,

        updateCompanySuccess: state.ComapnySlice.updateCompanySuccess,
        updateCompanyFailed: state.ComapnySlice.updateCompanyFailed,

        errorMessage: state.ComapnySlice.errorMessage,
    }));

    const { error, uplodes, loading, createUplodeSuccess, createUplodeFailed } = useSelector((state) => ({
        error: state.UplodeSlice.error,
        uplodes: state.UplodeSlice.uplodes,
        loading: state.UplodeSlice.loading,
        createUplodeSuccess: state.UplodeSlice.createUplodeSuccess,
        createUplodeFailed: state.UplodeSlice.createUplodeFailed,
    }));

    const [state, setState] = useState({
        companyId: '',
        companyName: '',
        companyMobile: '',
        companyAltMobile: '',
        companyMail: '',
        companyAddressOne: '',
        companyGstNo: '',
        companyAddressTwo: '',
        companyLogo: '',
        logoPreview: '',
        userId: '',
        userName: '',
        password: '',
        updatedAt: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);
    const [showPassword, setShowPassword] = useState(false);
    const [showUserName, setShowUserName] = useState(false);

    const errorHandle = useRef();

    // Check if user has update permission (Super Admin or has edit access)
    const canUpdate = roleIdforRole === 'Super Admin';

    useEffect(() => {
        setIsLoading(true);
        dispatch(getCompany());
    }, []);

    useEffect(() => {
        if (getCompanySuccess) {
            dispatch(resetCompanyStatus());
            setIsLoading(false);
            const companyDataItem = companyData?.data[0];

            setState({
                companyId: companyDataItem?.companyId || '',
                companyName: companyDataItem?.companyName || '',
                companyMobile: companyDataItem?.companyMobile || '',
                companyAltMobile: companyDataItem?.companyAltMobile || '',
                companyMail: companyDataItem?.companyMail || '',
                companyAddressOne: companyDataItem?.companyAddressOne || '',
                companyGstNo: companyDataItem?.companyGstNo || '',
                companyAddressTwo: companyDataItem?.companyAddressTwo || '',
                companyLogo: companyDataItem?.companyLogo ? [companyDataItem?.companyLogo] : [],
                logoPreview: companyDataItem?.companyLogo ? `${baseURL}${companyDataItem?.companyLogo}` : '',
                userId: companyDataItem?.userId || '',
                userName: companyDataItem?.userName || '',
                password: companyDataItem?.password || '',
                updatedAt: companyDataItem?.updatedAt || null,
            });
            dispatch(resetCompanyStatus());
        } else if (getCompanyFailed) {
            setIsLoading(false);
            dispatch(resetCompanyStatus());
        }
    }, [getCompanySuccess, getCompanyFailed]);

    useEffect(() => {
        if (updateCompanySuccess) {
            if (state.companyLogo && state.companyLogo instanceof File) {
                const formData = new FormData();
                const originalFile = state.companyLogo;

                const renamedFile = new File([originalFile], `Ashok-Finance-logo-${Date.now()}-${originalFile.name || 'logo'}`, {
                    type: originalFile.type,
                });
                formData.append('company', renamedFile);
                dispatch(createUplode({ request: formData, id: state?.companyId }));
            } else {
                showMessage('success', 'Company data updated successfully');
                dispatch(getCompany());
                dispatch(resetCompanyStatus());
            }
            dispatch(resetCompanyStatus());
        } else if (updateCompanyFailed) {
            showMessage('warning', errorMessage);
            dispatch(resetCompanyStatus());
        }
    }, [updateCompanySuccess, updateCompanyFailed]);

    useEffect(() => {
        if (createUplodeSuccess) {
            showMessage('success', 'Company logo uploaded successfully');
            dispatch(resetUplodeStatus());
            dispatch(getCompany());
            dispatch(resetCompanyStatus());
        } else if (createUplodeFailed) {
            showMessage('warning', 'Logo upload failed, but company data was updated');
            dispatch(getCompany());
            dispatch(resetUplodeStatus());
            dispatch(resetCompanyStatus());
        }
    }, [createUplodeSuccess, createUplodeFailed]);

    const onFormClear = () => {
        setErrors([]);
        setState({
            companyId: '',
            companyName: '',
            companyMobile: '',
            companyAltMobile: '',
            companyMail: '',
            companyAddressOne: '',
            companyGstNo: '',
            companyAddressTwo: '',
            companyLogo: '',
            logoPreview: '',
            userId: '',
            userName: '',
            password: '',
            updatedAt: null,
        });
    };

    const handleValidation = () => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company information');
            return;
        }
        errorHandle.current.validateFormFields();
    };

    const onFormSubmit = async () => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company information');
            return;
        }

        const submitRequest = {
            companyName: state?.companyName || '',
            companyMobile: state?.companyMobile || '',
            companyAltMobile: state?.companyAltMobile || '',
            companyMail: state?.companyMail || '',
            companyAddressOne: state?.companyAddressOne || '',
            companyAddressTwo: state?.companyAddressTwo || '',
            companyGstNo: state?.companyGstNo || '',
            userId: state?.userId || '',
            userName: state?.userName || '',
            password: state?.password || '',
        };

        dispatch(
            updateCompany({
                request: submitRequest,
                companyInfoId: state?.companyId,
            })
        );
    };

    const formImage = async (e, formName, formField) => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company logo');
            return;
        }

        if (Array.isArray(e) && e.length > 0) {
            const file = e[0].file;
            const imageURL = e[0].dataURL;

            setState((prevState) => {
                const newState = {
                    ...prevState,
                    companyLogo: file,
                    logoPreview: imageURL,
                };
                return newState;
            });
        } else if (e === null || e === undefined || (Array.isArray(e) && e.length === 0)) {
            setState((prevState) => ({
                ...prevState,
                companyLogo: '',
                logoPreview: '',
            }));
        } else {
            console.log(' Unknown format received:', e);
        }
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    const toggleUserNameVisibility = () => {
        setShowUserName(!showUserName);
    };

    // Mask sensitive data for non-Super Admin users
    const maskSensitiveData = (value) => {
        if (!value) return '';
        if (roleIdforRole === 'Super Admin') return value;
        
        // Mask the value (show only first and last character if length > 2)
        if (value.length <= 2) return '*'.repeat(value.length);
        return value.charAt(0) + '*'.repeat(value.length - 2) + value.charAt(value.length - 1);
    };

    return (
        <React.Fragment>
            {isLoading ? (
                <div className="bg-light opacity-0.25">
                    <div className="d-flex justify-content-center m-5">
                        <Spinner className="mt-5 mb-5" animation="border" />
                    </div>
                </div>
            ) : (
                <Card>
                    <Card.Body>
                        {/* Display role information */}
                        {roleIdforRole !== 'Super Admin' && (
                            <div className="alert alert-info mb-3">
                                <i className="fas fa-info-circle mr-2"></i>
                                You are viewing company information in read-only mode. Contact Super Admin for updates.
                            </div>
                        )}

                        <FormLayout
                            dynamicForm={employeeFormContainer}
                            handleSubmit={onFormSubmit}
                            setState={setState}
                            state={state}
                            ref={errorHandle}
                            onClickCallBack={{
                                formUpdate: handleValidation,
                                onFormClear: onFormClear,
                            }}
                            onChangeCallBack={{ formImage: formImage }}
                            noOfColumns={1}
                            errors={errors}
                            setErrors={setErrors}
                            readOnly={!canUpdate} // Make form read-only if user cannot update
                        />
                    </Card.Body>
                </Card>
            )}
        </React.Fragment>
    );
}

export default Index;