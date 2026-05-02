import React, { useEffect, useRef, useState } from 'react';
import { Badge, Button, Card, Spinner } from 'react-bootstrap';
import FormLayout from '../../util/formLayout';
import { useDispatch, useSelector } from 'react-redux';
import { employeeFormContainer } from './formFieldData';
import { findArrObj, showMessage, getAccessIdsByLabel } from '../../util/AllFunction';
import { getCompany, resetCompanyStatus, updateCompany } from '../../redux/companySlice';
import moment from 'moment';
import { baseURL } from '../../api/ApiConfig';

function Index() {
    const loginInfo = localStorage.getItem('loginInfo');
    const localData = JSON.parse(loginInfo);
    const accessIds = getAccessIdsByLabel(localData?.pagePermission || [], 'Company Info');
    const roleIdforRole = localData?.roleName;
    const dispatch = useDispatch();

    const { getCompanySuccess, companyData, getCompanyFailed, updateCompanySuccess, updateCompanyFailed } = useSelector((state) => ({
        getCompanySuccess: state.ComapnySlice?.getCompanySuccess,
        companyData: state.ComapnySlice?.companyData,
        getCompanyFailed: state.ComapnySlice?.getCompanyFailed,
        updateCompanySuccess: state.ComapnySlice?.updateCompanySuccess,
        updateCompanyFailed: state.ComapnySlice?.updateCompanyFailed,
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
        companyLogo: null,
        logoPreview: '',
        userId: '',
        userName: '',
        password: '',
        updatedAt: null,
    });
    const [isLoading, setIsLoading] = useState(false);
    const [errors, setErrors] = useState([]);

    const errorHandle = useRef();

    // Check if user has update permission (Super Admin only)
    const canUpdate = roleIdforRole === 'Super Admin';

    useEffect(() => {
        setIsLoading(true);
        dispatch(getCompany({}));
    }, []);

    useEffect(() => {
        if (getCompanySuccess) {
            setIsLoading(false);
            const companyDataItem = companyData?.data?.[0] || companyData?.[0];

            if (companyDataItem) {
                // Handle logo preview URL
                let logoPreviewUrl = '';
                if (companyDataItem.companyLogo) {
                    // Check if it's a full URL or relative path
                    if (companyDataItem.companyLogo.startsWith('http')) {
                        logoPreviewUrl = companyDataItem.companyLogo;
                    } else {
                        logoPreviewUrl = `${baseURL}${companyDataItem.companyLogo}`;
                    }
                }

                setState({
                    companyId: companyDataItem.companyId || companyDataItem.company_id || '',
                    companyName: companyDataItem.companyName || companyDataItem.company_name || '',
                    companyMobile: companyDataItem.companyMobile || companyDataItem.company_mobile || '',
                    companyAltMobile: companyDataItem.companyAltMobile || companyDataItem.company_alt_mobile || '',
                    companyMail: companyDataItem.companyMail || companyDataItem.company_mail || '',
                    companyAddressOne: companyDataItem.companyAddressOne || companyDataItem.company_address_one || '',
                    companyGstNo: companyDataItem.companyGstNo || companyDataItem.company_gst_no || '',
                    companyAddressTwo: companyDataItem.companyAddressTwo || companyDataItem.company_address_two || '',
                    companyLogo: null,
                    logoPreview: logoPreviewUrl,
                    userId: companyDataItem.userId || companyDataItem.user_id || '',
                    userName: companyDataItem.userName || companyDataItem.user_name || '',
                    password: companyDataItem.password || '',
                    updatedAt: companyDataItem.updatedAt || null,
                });
            }
            dispatch(resetCompanyStatus());
        } else if (getCompanyFailed) {
            setIsLoading(false);
            dispatch(resetCompanyStatus());
            showMessage('error', 'Failed to load company information');
        }
    }, [getCompanySuccess, getCompanyFailed]);

    useEffect(() => {
        if (updateCompanySuccess) {
            showMessage('success', 'Company information updated successfully');
            dispatch(getCompany({}));
            dispatch(resetCompanyStatus());
        } else if (updateCompanyFailed) {
            showMessage('error', 'Failed to update company information');
            dispatch(resetCompanyStatus());
        }
    }, [updateCompanySuccess, updateCompanyFailed]);

    const onFormClear = () => {
        setErrors([]);
    };

    const handleValidation = () => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company information');
            return;
        }
        if (errorHandle.current) {
            errorHandle.current.validateFormFields();
        }
    };

    const onFormSubmit = async () => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company information');
            return;
        }

        // Create FormData for multipart upload
        const formData = new FormData();
        
        formData.append('companyName', state?.companyName || '');
        formData.append('companyMobile', state?.companyMobile || '');
        formData.append('companyAltMobile', state?.companyAltMobile || '');
        formData.append('companyMail', state?.companyMail || '');
        formData.append('companyAddressOne', state?.companyAddressOne || '');
        formData.append('companyAddressTwo', state?.companyAddressTwo || '');
        formData.append('companyGstNo', state?.companyGstNo || '');
        formData.append('userId', state?.userId || '');
        formData.append('userName', state?.userName || '');
        
        if (state?.password) {
            formData.append('password', state?.password);
        }
        
        if (state?.companyLogo && state.companyLogo instanceof File) {
            formData.append('companyLogo', state.companyLogo);
        }

        dispatch(updateCompany({
            request: formData,
            companyInfoId: state?.companyId
        }));
    };

    const formImage = async (e, formName, formField) => {
        if (!canUpdate) {
            showMessage('warning', 'You do not have permission to update company logo');
            return;
        }

        if (Array.isArray(e) && e.length > 0) {
            const file = e[0].file;
            const imageURL = e[0].dataURL;

            setState((prevState) => ({
                ...prevState,
                companyLogo: file,
                logoPreview: imageURL,
            }));
        } else if (e === null || e === undefined || (Array.isArray(e) && e.length === 0)) {
            setState((prevState) => ({
                ...prevState,
                companyLogo: null,
                logoPreview: '',
            }));
        }
    };

    // Mask sensitive data for non-Super Admin users
    const getMaskedValue = (value) => {
        if (!value) return '';
        if (roleIdforRole === 'Super Admin') return value;
        
        // Mask the value for non-admin users
        if (value.length <= 2) return '*'.repeat(value.length);
        return value.charAt(0) + '*'.repeat(value.length - 2) + value.charAt(value.length - 1);
    };

    if (isLoading) {
        return (
            <div className="bg-light opacity-0.25">
                <div className="d-flex justify-content-center m-5">
                    <Spinner className="mt-5 mb-5" animation="border" />
                </div>
            </div>
        );
    }

    return (
        <React.Fragment>
            <Card>
                <Card.Body>
                    {/* Display role information */}
                    {!canUpdate && (
                        <div className="alert alert-info mb-3">
                            <i className="fas fa-info-circle mr-2"></i>
                            You are viewing company information in read-only mode. Contact Super Admin for updates.
                        </div>
                    )}

                    {/* Logo Preview Card */}
                    {state.logoPreview && (
                        <div className="mb-4 p-3 border rounded bg-light">
                            <div className="d-flex align-items-center">
                                <div className="mr-3">
                                    <img 
                                        src={state.logoPreview} 
                                        alt="Company Logo" 
                                        crossOrigin="anonymous"
                                        style={{ maxWidth: '100px', maxHeight: '100px', objectFit: 'contain' }}
                                        className="rounded"
                                    />
                                </div>
                                <div>
                                </div>
                            </div>
                        </div>
                    )}

                    <FormLayout
                        dynamicForm={employeeFormContainer}
                        handleSubmit={onFormSubmit}
                        setState={setState}
                        state={{
                            ...state,
                            // Mask sensitive data for non-admin users in display
                            userName: !canUpdate && state.userName ? getMaskedValue(state.userName) : state.userName,
                            password: !canUpdate && state.password ? getMaskedValue(state.password) : state.password,
                        }}
                        ref={errorHandle}
                        onClickCallBack={{
                            formUpdate: handleValidation,
                            onFormClear: onFormClear,
                        }}
                        onChangeCallBack={{ formImage: formImage }}
                        noOfColumns={1}
                        errors={errors}
                        setErrors={setErrors}
                        readOnly={!canUpdate}
                    />
                </Card.Body>
            </Card>
        </React.Fragment>
    );
}

export default Index;