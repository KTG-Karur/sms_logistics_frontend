import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { setPageTitle, toggleRTL } from '../../redux/themeStore/themeConfigSlice';
import Dropdown from '../../components/Dropdown';
import i18next from 'i18next';
import IconCaretDown from '../../components/Icon/IconCaretDown';
import IconMail from '../../components/Icon/IconMail';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconBuilding from '../../components/Icon/IconBuilding';
import IconUser from '../../components/Icon/IconUser';
import IconEye from '../../components/Icon/IconEye';
import IconEyeOff from '../../components/Icon/IconEyeOff';
import IconShield from '../../components/Icon/IconShield';
import IconChecklist from '../../components/Icon/IconChecks';
import IconFactory from '../../components/Icon/IconBuilding';
import { getLogin, resetLoginStatus } from '../../redux/loginSlice';
import { showMessage } from '../../util/AllFunction';
import { DotLottieReact } from '@lottiefiles/dotlottie-react';

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const { getLoginSuccess, getLoginFailed, error, loginData } = useSelector((state) => ({
        getLoginSuccess: state.LoginSlice.getLoginSuccess,
        getLoginFailed: state.LoginSlice.getLoginFailed,
        error: state.LoginSlice.error,
        loginData: state.LoginSlice.loginData,
    }));

    const navigate = useNavigate();
    const isRtl = useSelector((state) => state.themeConfig.rtlClass) === 'rtl';
    const themeConfig = useSelector((state) => state.themeConfig);

    const [flag, setFlag] = useState(themeConfig.locale);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [isFocused, setIsFocused] = useState({ username: false, password: false });

    const mobileFormRef = useRef(null);
    const desktopFormRef = useRef(null);

    useEffect(() => {
        dispatch(setPageTitle('Supplier Compliance Audit System'));
    }, [dispatch]);

    useEffect(() => {
        if (getLoginSuccess) {
            setIsLoading(false);
            if (loginData?.data[0]) localStorage.setItem('loginInfo', JSON.stringify(loginData?.data[0]));

            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.style.transform = 'scale(0.95)';
                currentFormRef.style.opacity = '0.8';
            }

            setTimeout(() => {
                navigate('/');
                dispatch(resetLoginStatus());
            }, 300);
        } else if (getLoginFailed) {
            setIsLoading(false);
            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.classList.add('shake-animation');
                setTimeout(() => {
                    currentFormRef.classList.remove('shake-animation');
                }, 500);
            }
            showMessage('error', error || 'Authentication Failed');
        }
    }, [getLoginSuccess, getLoginFailed, loginData, error, navigate]);

    const setLocale = (flag) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const submitForm = (e) => {
        e.preventDefault();
        if (!username || !password) {
            showMessage('error', 'Please enter username and password');
            const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
            if (currentFormRef) {
                currentFormRef.classList.add('shake-animation');
                setTimeout(() => {
                    currentFormRef.classList.remove('shake-animation');
                }, 500);
            }
            return;
        }

        setIsLoading(true);
        dispatch(getLogin({ userName: username, password }));
    };

    const handleFocus = (field) => {
        setIsFocused((prev) => ({ ...prev, [field]: true }));
    };

    const handleBlur = (field) => {
        setIsFocused((prev) => ({ ...prev, [field]: false }));
    };

    const togglePasswordVisibility = () => {
        setShowPassword(!showPassword);
    };

    return (
        <div className="relative min-h-screen w-full overflow-hidden">
            <div
                className="fixed inset-0 -z-10"
                style={{
                    background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 30%, #1e40af 70%, #3730a3 100%)',
                    width: '100vw',
                    height: '100vh',
                    margin: 0,
                    padding: 0,
                }}
            ></div>

            {/* Audit Pattern Background */}
            <div
                className="fixed inset-0 opacity-10 -z-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    width: '100vw',
                    height: '100vh',
                }}
            ></div>

            {/* Grid lines for audit sheet feel */}
            <div className="fixed inset-0 overflow-hidden -z-5 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(90deg, transparent 99%, rgba(255,255,255,0.3) 99%),
                        linear-gradient(0deg, transparent 99%, rgba(255,255,255,0.3) 99%)
                    `,
                    backgroundSize: '20px 20px',
                }}></div>
            </div>

            {/* Audit-themed geometric shapes */}
            <div className="fixed inset-0 overflow-hidden -z-5">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-indigo-600/5 rounded-full blur-xl"></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-500/5 rounded-lg blur-lg rotate-12"></div>
                <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-yellow-500/5 rounded-lg blur-lg -rotate-12"></div>
            </div>

            {/* Main Content Container */}
            <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
                {/* Mobile & Tablet: Single Column Layout */}
                <div className="block lg:hidden w-full max-w-md">
                    {/* Mobile Header */}
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-lg">
                                <IconShield className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Supplier Compliance Audit</h1>
                        <p className="text-blue-200 text-sm">Enterprise Audit Management System</p>
                    </div>

                    {/* Mobile Lottie Animation */}
                    <div className="flex justify-center mb-6">
                        <div className="w-64 h-52 flex items-center justify-center">
                            <DotLottieReact src="/Data Management.lottie" loop autoplay />
                        </div>
                    </div>

                    {/* Mobile Features */}
                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <IconFactory className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Supplier Audits</div>
                                    <div className="text-blue-100 text-sm">Comprehensive factory inspections</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <IconChecklist className="w-5 h-5 text-blue-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">CAPA Management</div>
                                    <div className="text-blue-100 text-sm">Corrective & Preventive Actions</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Login Form for Mobile */}
                    <div
                        ref={mobileFormRef}
                        className="relative w-full rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-6 shadow-2xl transition-all duration-500"
                        style={{
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                        }}
                    >
                        <div className="mb-8 text-center">
                            <div className="flex justify-center mb-4">
                                <img 
                                    style={{ width: '200px', height: '40px' }} 
                                    className="flex-none drop-shadow-2xl filter brightness-110" 
                                    src="/assets/images/Asian logo_02.png" 
                                    alt="logo" 
                                />
                            </div>
                            <p className="text-gray-600 text-sm">Enter credentials for Audit System access</p>
                        </div>
                        <form className="space-y-5" onSubmit={submitForm}>
                            {/* Username Field */}
                            <div className="space-y-2">
                                <label htmlFor="mobile-username" className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <IconUser className="w-4 h-4 mr-2 text-gray-500" />
                                    Username
                                </label>
                                <div className="relative">
                                    <input
                                        id="mobile-username"
                                        type="text"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        onFocus={() => handleFocus('username')}
                                        onBlur={() => handleBlur('username')}
                                        placeholder="Auditor / Admin username"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IconUser className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <label htmlFor="mobile-password" className="block text-sm font-semibold text-gray-700 flex items-center">
                                    <IconLockDots className="w-4 h-4 mr-2 text-gray-500" />
                                    Password
                                </label>
                                <div className="relative">
                                    <input
                                        id="mobile-password"
                                        type={showPassword ? 'text' : 'password'}
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        onFocus={() => handleFocus('password')}
                                        onBlur={() => handleBlur('password')}
                                        placeholder="Enter secure password"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IconLockDots className="w-5 h-5" />
                                    </span>
                                    <button
                                        type="button"
                                        onClick={togglePasswordVisibility}
                                        className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                    >
                                        {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                    </button>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-3 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                    isLoading ? 'animate-pulse' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <div className="flex items-center justify-center space-x-2">
                                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                        <span>Authenticating...</span>
                                    </div>
                                ) : (
                                    <div className="flex items-center justify-center space-x-2">
                                        <IconShield className="w-5 h-5" />
                                        <span>Access Audit System</span>
                                    </div>
                                )}
                            </button>
                        </form>

                        {/* Security Notice */}
                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <IconShield className="w-4 h-4" />
                                <span>ISO 27001 Compliant Security</span>
                            </div>
                        </div>

                        {/* Version Info */}
                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">Audit System v3.0 • Production</p>
                        </div>
                    </div>
                </div>

                {/* Desktop: Two Column Layout */}
                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
                    {/* Left Side - Audit System Introduction */}
                    <div className="flex flex-col justify-center text-white space-y-8 p-8">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center shadow-xl">
                                    <IconShield className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold leading-tight">
                                        Supplier Compliance
                                        <br />
                                        <span className="text-blue-300">Audit System</span>
                                    </h1>
                                    <p className="text-blue-100 text-lg mt-2">Enterprise-grade compliance management</p>
                                </div>
                            </div>

                            {/* Audit System Lottie */}
                            <div className="flex justify-center mb-6">
                                <div className="w-full h-64">
                                   <DotLottieReact src="/Data Management.lottie" loop autoplay className="w-full h-full" />

                                </div>
                            </div>

                            <p className="text-lg text-blue-100 leading-relaxed">
                                Comprehensive audit management platform for supplier compliance, 
                                CAPA tracking, and regulatory adherence across your supply chain.
                            </p>
                        </div>

                        {/* Features Grid */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <IconFactory className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Factory Audits</div>
                                        <div className="text-blue-100 text-xs">On-site inspections</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <IconChecklist className="w-6 h-6 text-blue-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">CAPA Tracking</div>
                                        <div className="text-blue-100 text-xs">Action management</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <IconShield className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Standards</div>
                                        <div className="text-blue-100 text-xs">IWAY, BSCI, ISO</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                        <div className="text-lg">📊</div>
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Reporting</div>
                                        <div className="text-blue-100 text-xs">Analytics & insights</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Login Form */}
                    <div className="flex justify-center lg:justify-end">
                        <div
                            ref={desktopFormRef}
                            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500"
                            style={{
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            {/* Form Header */}
                            <div className="mb-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <img 
                                        style={{ width: '220px', height: '45px' }} 
                                        className="flex-none drop-shadow-2xl filter brightness-110" 
                                        src="/assets/images/Asian logo_02.png" 
                                        alt="logo" 
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Audit System Login</h2>
                                <p className="text-gray-600 text-sm">Secure access to compliance management platform</p>
                            </div>

                            <form className="space-y-6" onSubmit={submitForm}>
                                {/* Username Field */}
                                <div className="space-y-2">
                                    <label htmlFor="desktop-username" className="block text-sm font-semibold text-gray-700 flex items-center">
                                        <IconUser className="w-4 h-4 mr-2 text-gray-500" />
                                        Username
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="desktop-username"
                                            type="text"
                                            value={username}
                                            onChange={(e) => setUsername(e.target.value)}
                                            onFocus={() => handleFocus('username')}
                                            onBlur={() => handleBlur('username')}
                                            placeholder="Enter auditor/admin username"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconUser className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

                                {/* Password Field */}
                                <div className="space-y-2">
                                    <label htmlFor="desktop-password" className="block text-sm font-semibold text-gray-700 flex items-center">
                                        <IconLockDots className="w-4 h-4 mr-2 text-gray-500" />
                                        Password
                                    </label>
                                    <div className="relative">
                                        <input
                                            id="desktop-password"
                                            type={showPassword ? 'text' : 'password'}
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            onFocus={() => handleFocus('password')}
                                            onBlur={() => handleBlur('password')}
                                            placeholder="Enter secure password"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconLockDots className="w-5 h-5" />
                                        </span>
                                        <button
                                            type="button"
                                            onClick={togglePasswordVisibility}
                                            className="absolute end-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                                        >
                                            {showPassword ? <IconEyeOff className="w-5 h-5" /> : <IconEye className="w-5 h-5" />}
                                        </button>
                                    </div>
                                </div>

                               
                                {/* Submit Button */}
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className={`w-full rounded-xl bg-gradient-to-r from-blue-600 to-indigo-700 py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:from-blue-700 hover:to-indigo-800 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
                                        isLoading ? 'animate-pulse' : ''
                                    }`}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center space-x-2">
                                            <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                                            <span className="text-lg">Authenticating...</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center space-x-3">
                                            <IconShield className="w-6 h-6" />
                                            <span className="text-lg">Access Audit Dashboard</span>
                                        </div>
                                    )}
                                </button>
                            </form>                          
                            {/* Version Info */}
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400">Supplier Compliance Audit System v3.0 • Asian Fabricx Pvt Ltd</p>
                                <p className="text-xs text-gray-400 mt-1">© 2024 All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Add custom styles for full viewport coverage */}
            <style jsx global>{`
                * {
                    margin: 0;
                    padding: 0;
                    box-sizing: border-box;
                }

                html,
                body,
                #root {
                    width: 100%;
                    height: 100%;
                    margin: 0;
                    padding: 0;
                    overflow-x: hidden;
                }

                .shake-animation {
                    animation: shake 0.5s ease-in-out;
                }

                @keyframes shake {
                    0%,
                    100% {
                        transform: translateX(0);
                    }
                    25% {
                        transform: translateX(-5px);
                    }
                    75% {
                        transform: translateX(5px);
                    }
                }

                /* Remove black outline from all inputs */
                input:focus,
                button:focus,
                select:focus,
                textarea:focus {
                    outline: none !important;
                    box-shadow: none !important;
                }

                /* Ensure proper touch targets for mobile */
                @media (max-width: 768px) {
                    input,
                    button {
                        font-size: 16px; /* Prevent zoom on iOS */
                    }

                    button {
                        min-height: 44px; /* Minimum touch target size */
                    }
                }

                /* Audit-style grid background */
                .audit-grid {
                    background-image: 
                        linear-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(90deg, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>
        </div>
    );
};

export default LoginBoxed;