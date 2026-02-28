import { Routes, Route } from 'react-router-dom';
import Login from '../pages/Login';
import EmployeeRoutes from './EmployeeRoutes';
import SupervisorRoutes from './SupervisorRoutes';
import AdminRoutes from './AdminRoutes';


const AppRoutes = () => {
    return (
        <Routes>
            <Route path="/" element={<Login />} />
            <Route path="/employee/*" element={<EmployeeRoutes />} />
            <Route path="/supervisor/*" element={<SupervisorRoutes />} />
            <Route path="/*" element={<AdminRoutes />} />
        </Routes>
    );
};

export default AppRoutes;
