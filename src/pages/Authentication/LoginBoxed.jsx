import { useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useState, useRef } from 'react';
import { setPageTitle, toggleRTL } from '../../redux/themeStore/themeConfigSlice';
import IconLockDots from '../../components/Icon/IconLockDots';
import IconUser from '../../components/Icon/IconUser';
import IconEye from '../../components/Icon/IconEye';
import IconEyeOff from '../../components/Icon/IconEyeOff';
import IconShield from '../../components/Icon/IconShield';
import IconTruck from '../../components/Icon/IconTruck';
import IconPackage from '../../components/Icon/IconPackage';
import IconWarehouse from '../../components/Icon/IconWarehouse';
import IconRoute from '../../components/Icon/IconRouter';
// import IconShip from '../../components/Icon/IconShip';
// import IconPlane from '../../components/Icon/IconPlane';
import { getLogin, resetLoginStatus } from '../../redux/loginSlice';
import { showMessage } from '../../util/AllFunction';
import Lottie from "lottie-react";
import LogisticLottie from '../../assets/logistics.json'

const LoginBoxed = () => {
    const dispatch = useDispatch();
    const errorShownRef = useRef(false);
    const { getLoginSuccess, getLoginFailed, error, loginData } = useSelector((state) => ({
        getLoginSuccess: state.LoginSlice.getLoginSuccess,
        getLoginFailed: state.LoginSlice.getLoginFailed,
        error: state.LoginSlice.error,
        loginData: state.LoginSlice.loginData,
    }));

    const navigate = useNavigate();
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
        dispatch(setPageTitle('Logistics & Transportation Management System'));
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
            console.log('Login failed error:', error);
            
            // Check if it's a 401 error
            if (error && error.includes('401') || error.includes('Unauthorized')) {
                localStorage.clear();
                showMessage('error', 'Session expired. Please login again.');
                setTimeout(() => {
                    navigate('/auth/boxed-signin');
                }, 2000);
            } else {
                const currentFormRef = window.innerWidth < 1024 ? mobileFormRef.current : desktopFormRef.current;
                if (currentFormRef) {
                    currentFormRef.classList.add('shake-animation');
                    setTimeout(() => {
                        currentFormRef.classList.remove('shake-animation');
                    }, 500);
                }
                
                if (error && !errorShownRef.current) {
                    showMessage('error', error || 'Authentication Failed');
                    errorShownRef.current = true;
                    setTimeout(() => {
                        errorShownRef.current = false;
                    }, 2000);
                }
            }
        }
    }, [getLoginSuccess, getLoginFailed, loginData, error, navigate, dispatch]);

    const setLocale = (flag) => {
        setFlag(flag);
        if (flag.toLowerCase() === 'ae') {
            dispatch(toggleRTL('rtl'));
        } else {
            dispatch(toggleRTL('ltr'));
        }
    };

    const handleLogin = () => {
        console.log('Login button clicked');
        
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
                    background: 'linear-gradient(135deg, #cc711c 0%, #cc7920 30%, #f6bb3b 70%, #cfd81d 100%)',
                    width: '100vw',
                    height: '100vh',
                    margin: 0,
                    padding: 0,
                }}
            ></div>

            <div
                className="fixed inset-0 opacity-10 -z-5"
                style={{
                    backgroundImage: `radial-gradient(circle at 2px 2px, rgba(255,255,255,0.15) 1px, transparent 0)`,
                    backgroundSize: '40px 40px',
                    width: '100vw',
                    height: '100vh',
                }}
            ></div>

            <div className="fixed inset-0 overflow-hidden -z-5 opacity-5">
                <div className="absolute inset-0" style={{
                    backgroundImage: `
                        linear-gradient(90deg, transparent 99%, rgba(255,255,255,0.3) 99%),
                        linear-gradient(0deg, transparent 99%, rgba(255,255,255,0.3) 99%)
                    `,
                    backgroundSize: '20px 20px',
                }}></div>
            </div>

            <div className="fixed inset-0 overflow-hidden -z-5">
                <div className="absolute top-20 left-10 w-32 h-32 bg-blue-600/5 rounded-full blur-xl"></div>
                <div className="absolute bottom-20 right-10 w-40 h-40 bg-blue-700/5 rounded-full blur-xl"></div>
                <div className="absolute top-1/3 right-1/4 w-16 h-16 bg-green-500/5 rounded-lg blur-lg rotate-12"></div>
                <div className="absolute bottom-1/3 left-1/4 w-24 h-24 bg-yellow-500/5 rounded-lg blur-lg -rotate-12"></div>
            </div>

            <div className="relative flex min-h-screen items-center justify-center px-4 sm:px-6 lg:px-8 py-8 w-full">
                <div className="block lg:hidden w-full max-w-md">
                    <div className="text-center mb-8">
                        <div className="flex justify-center mb-4">
                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
                                <IconTruck className="w-8 h-8 text-white" />
                            </div>
                        </div>
                        <h1 className="text-2xl font-bold text-white mb-2">Logistics Management</h1>
                        <p className="text-orange-200 text-sm">Transport & Supply Chain Platform</p>
                    </div>

                    <div className="flex justify-center mb-6">
                        <div className="w-64 h-52 flex items-center justify-center">
                            <Lottie
                                animationData={LogisticLottie}
                                loop={true}
                                autoplay={true}
                                style={{ width: "100%", height: "100%" }}
                            />
                        </div>
                    </div>

                    <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 mb-6 border border-white/20">
                        <div className="space-y-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-green-500/20 flex items-center justify-center">
                                    <IconTruck className="w-5 h-5 text-green-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Fleet Management</div>
                                    <div className="text-orange-100 text-sm">Real-time vehicle tracking</div>
                                </div>
                            </div>
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                    <IconPackage className="w-5 h-5 text-orange-400" />
                                </div>
                                <div>
                                    <div className="text-white font-medium">Shipment Tracking</div>
                                    <div className="text-orange-100 text-sm">End-to-end cargo visibility</div>
                                </div>
                            </div>
                        </div>
                    </div>

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
                                    src="/assets/images/SMS logo_02.png" 
                                    alt="logo" 
                                />
                            </div>
                            <p className="text-gray-600 text-sm">Access Logistics Management System</p>
                        </div>
                        
                        <div className="space-y-5">
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
                                        placeholder="Enter your username"
                                        className="w-full rounded-xl border border-gray-300 bg-white px-12 py-3 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 focus:shadow-lg text-base outline-none"
                                    />
                                    <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                        <IconUser className="w-5 h-5" />
                                    </span>
                                </div>
                            </div>

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
                                        placeholder="Enter your password"
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

                            <button
                                type="button"
                                onClick={handleLogin}
                                disabled={isLoading}
                                className={`w-full rounded-xl bg-gradient-to-r from-orange-600 to-yellow-400 py-3 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:from-blue-700 hover:to-blue-900 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
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
                                        <IconTruck className="w-5 h-5" />
                                        <span>Access Logistics Portal</span>
                                    </div>
                                )}
                            </button>
                        </div>

                        <div className="mt-6 pt-4 border-t border-gray-200">
                            <div className="flex items-center justify-center space-x-2 text-xs text-gray-500">
                                <IconShield className="w-4 h-4" />
                                <span>Secure Transport Management System</span>
                            </div>
                        </div>

                        <div className="mt-4 text-center">
                            <p className="text-xs text-gray-400">Logistics System v4.0 • Production</p>
                        </div>
                    </div>
                </div>

                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-2 gap-12 w-full max-w-6xl items-center">
                    <div className="flex flex-col justify-center text-white space-y-8 p-8">
                        <div className="space-y-6">
                            <div className="flex items-center space-x-4">
                                <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-600 to-yellow-400 flex items-center justify-center shadow-xl">
                                    <IconTruck className="w-10 h-10 text-white" />
                                </div>
                                <div>
                                    <h1 className="text-4xl font-bold leading-tight">
                                        Logistics & Transportation
                                        <br />
                                        <span className="text-yellow-300">Management System</span>
                                    </h1>
                                    <p className="text-orange-100 text-lg mt-2">End-to-end supply chain visibility</p>
                                </div>
                            </div>

                            <div className="flex justify-center mb-6">
                                <div className="w-full h-64">
                                    <Lottie
                                        animationData={LogisticLottie}
                                        loop={true}
                                        autoplay={true}
                                        style={{ width: "100%", height: "100%" }}
                                    />
                                </div>
                            </div>

                            <p className="text-lg text-orange-100 leading-relaxed">
                                Comprehensive logistics platform for fleet management, shipment tracking, 
                                warehouse operations, and real-time transportation monitoring across your supply chain.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-green-500/20 flex items-center justify-center">
                                        <IconTruck className="w-6 h-6 text-green-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Fleet Management</div>
                                        <div className="text-orange-100 text-xs">Vehicle tracking & maintenance</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-blue-500/20 flex items-center justify-center">
                                        <IconPackage className="w-6 h-6 text-orange-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Shipment Tracking</div>
                                        <div className="text-orange-100 text-xs">Real-time cargo visibility</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-purple-500/20 flex items-center justify-center">
                                        <IconWarehouse className="w-6 h-6 text-purple-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Warehouse Ops</div>
                                        <div className="text-orange-100 text-xs">Inventory & storage</div>
                                    </div>
                                </div>
                            </div>
                            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 border border-white/20">
                                <div className="flex items-center space-x-3">
                                    <div className="w-12 h-12 rounded-lg bg-yellow-500/20 flex items-center justify-center">
                                        <IconRoute className="w-6 h-6 text-yellow-400" />
                                    </div>
                                    <div>
                                        <div className="text-white font-semibold">Route Planning</div>
                                        <div className="text-orange-100 text-xs">Optimized delivery routes</div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-center lg:justify-end">
                        <div
                            ref={desktopFormRef}
                            className="relative w-full max-w-md rounded-2xl border border-white/20 bg-white/95 backdrop-blur-xl p-8 shadow-2xl transition-all duration-500"
                            style={{
                                boxShadow: '0 20px 60px rgba(0, 0, 0, 0.15)',
                            }}
                        >
                            <div className="mb-8 text-center">
                                <div className="flex justify-center mb-4">
                                    <img 
                                        style={{ width: '220px', height: '45px' }} 
                                        className="flex-none drop-shadow-2xl filter brightness-110" 
                                        src="/assets/images/SMS logo_02.png" 
                                        alt="logo" 
                                    />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800 mb-2">Logistics Portal Login</h2>
                                <p className="text-gray-600 text-sm">Secure access to transportation management system</p>
                            </div>

                            <div className="space-y-6">
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
                                            placeholder="Enter your username"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none"
                                        />
                                        <span className="absolute start-4 top-1/2 -translate-y-1/2 text-gray-400">
                                            <IconUser className="w-5 h-5" />
                                        </span>
                                    </div>
                                </div>

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
                                            placeholder="Enter your password"
                                            className="w-full rounded-xl border border-gray-300 bg-white px-12 py-4 text-gray-800 placeholder-gray-500 shadow-sm transition-all duration-200 focus:border-orange-500 focus:ring-2 focus:ring-orange-200 focus:shadow-lg text-base outline-none"
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

                                <button
                                    type="button"
                                    onClick={handleLogin}
                                    disabled={isLoading}
                                    className={`w-full rounded-xl bg-gradient-to-r from-orange-600 to-yellow-400 py-4 font-semibold text-white shadow-lg transition-all duration-300 transform hover:shadow-xl hover:from-orange-700 hover:to-yellow-400 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none ${
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
                                            <IconTruck className="w-6 h-6" />
                                            <span className="text-lg">Access Logistics Dashboard</span>
                                        </div>
                                    )}
                                </button>
                            </div>
                            
                            <div className="mt-4 text-center">
                                <p className="text-xs text-gray-400">Transport Management System v4.0 • Asian Fabricx Pvt Ltd</p>
                                <p className="text-xs text-gray-400 mt-1">© 2024 All rights reserved</p>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginBoxed;