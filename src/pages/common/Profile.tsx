import React, { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/auth.store';
import authService from '../../services/auth.service';
import DashboardLayout from '../../layouts/DashboardLayout';
import { Select } from '../../components/common/Select';
import { useProvinces, useDepartments } from '../../hooks/useOrganization';
import {
    User,
    Mail,
    Phone,
    Building2,
    MapPin,
    Shield,
    Hash,
    X,
    CheckCircle2,
} from 'lucide-react';

const Profile: React.FC = () => {
    const { user, refreshUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Edit form state
    const [fullName, setFullName] = useState('');
    const [phone, setPhone] = useState('');
    const [provinceId, setProvinceId] = useState('');
    const [departmentId, setDepartmentId] = useState('');

    // Use hooks for dropdown data
    const { data: provinces = [] } = useProvinces();
    const { data: departments = [] } = useDepartments();

    // Initialize form from user data
    useEffect(() => {
        if (user) {
            setFullName(user.fullName || '');
            setPhone(user.phone || '');
            setProvinceId(user.province?.id || '');
            setDepartmentId(user.department?.id || '');
        }
    }, [user]);

    // Fetch dropdown data effect removed as it is now handled by hooks

    const getUserInitials = () => {
        if (!user?.fullName) return 'U';
        const names = user.fullName.split(' ');
        if (names.length >= 2) {
            return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
        }
        return names[0].charAt(0).toUpperCase();
    };

    const formatRole = (roleName?: string) => {
        if (!roleName) return 'User';
        return roleName
            .split('_')
            .map(word => word.charAt(0) + word.slice(1).toLowerCase())
            .join(' ');
    };

    if (!user) return null;

    const isOHSNational = user.role?.name?.toLowerCase().replace(/\s+/g, '_') === 'ohs_national_office';

    // Simplified read-only profile for OHS National Office
    if (isOHSNational) {
        return (
            <DashboardLayout
                title="Profile"
                description="DLRRD Facilities Management Services"
            >
                <div className="max-w-3xl mx-auto flex flex-col gap-5">
                    {/* Profile Header */}
                    <div className="bg-white rounded-xl border border-gray-100 px-6 py-5 flex items-center gap-4">
                        <div className="w-14 h-14 rounded-full bg-light-gold flex items-center justify-center text-brown font-bold text-xl shrink-0 border-2 border-gold/20">
                            {getUserInitials()}
                        </div>
                        <div className="flex-1">
                            <h2 className="text-lg font-bold text-gray-800">{user.fullName}</h2>
                            <p className="text-xs text-gray-400 font-medium">{formatRole(user.role?.name)}</p>
                        </div>
                    </div>

                    {/* Account Information */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6">
                        <h3 className="text-base font-bold text-gray-800 mb-5">Account information</h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
                            {/* Full name */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Full name</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.fullName || '—'}</div>
                            </div>

                            {/* Employee ID */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Employee ID</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.employeeNumber || '—'}</div>
                            </div>

                            {/* Email */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Email</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.email || '—'}</div>
                            </div>

                            {/* Phone */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Phone</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.phone || '—'}</div>
                            </div>

                            {/* Directorate */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Directorate</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.department?.name || 'Rural Development and Land Reform'}</div>
                            </div>

                            {/* Office */}
                            <div>
                                <label className="text-xs font-bold text-gray-800 block mb-1.5">Office</label>
                                <div className="px-3.5 py-2.5 bg-subtle-grey rounded-lg text-sm text-gray-600">{user.department?.building?.name || user.province?.name || '—'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout
            title="My Profile"
            description="My Profile"
            breadcrumbs={[{ label: "Dashboard" }, { label: "Profile" }]}
        >
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Success Banner */}
                {success && (
                    <div className="flex items-center gap-3 bg-light-gold border border-gold/20 text-brown px-4 py-3 rounded-xl animate-fadeIn">
                        <CheckCircle2 size={18} />
                        <span className="text-sm font-semibold">Profile updated successfully!</span>
                    </div>
                )}

                {/* Error Banner */}
                {error && (
                    <div className="flex items-center gap-3 bg-subtle-red border border-red/20 text-red px-4 py-3 rounded-xl">
                        <X size={18} />
                        <span className="text-sm font-semibold">{error}</span>
                    </div>
                )}

                {/* Profile Header Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                    {/* Green banner */}
                    <div className="h-28 bg-gradient-to-r from-brown to-gold"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar overlapping banner */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                            <div className="w-24 h-24 rounded-full bg-gold flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 text-center sm:text-left pb-1">
                                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                                <p className="text-sm text-gray-500">{formatRole(user.role?.name)}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Profile Details Card */}
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8">
                    <h3 className="text-lg font-bold text-gray-800 mb-6">Personal Information</h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Full Name */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <User size={14} /> Full Name
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.fullName || '-'}</p>
                            )}
                        </div>

                        {/* Email (always read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Mail size={14} /> Email
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.email}</p>
                        </div>

                        {/* Phone */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Phone size={14} /> Phone
                            </label>
                            {isEditing ? (
                                <input
                                    type="text"
                                    value={phone}
                                    onChange={(e) => setPhone(e.target.value)}
                                    placeholder="+27-XX-XXX-XXXX"
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-gold/20 focus:border-gold transition-all"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.phone || '-'}</p>
                            )}
                        </div>

                        {/* Employee Number (read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Hash size={14} /> Employee Number
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.employeeNumber || '-'}</p>
                        </div>

                        {/* Role (read-only) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Shield size={14} /> Role
                            </label>
                            <div className="py-2.5">
                                <span className="inline-flex items-center px-3 py-1 bg-light-gold text-brown text-xs font-bold rounded-full">
                                    {formatRole(user.role?.name)}
                                </span>
                            </div>
                        </div>

                        {/* Department */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Building2 size={14} /> Department
                            </label>
                            {isEditing ? (
                                <Select
                                    value={departmentId}
                                    onChange={setDepartmentId}
                                    options={departments.map(d => ({ value: d.id, label: d.name }))}
                                    placeholder="Select Department"
                                    bgColor="bg-subtle-grey"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.department?.name || '-'}</p>
                            )}
                        </div>

                        {/* Province */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <MapPin size={14} /> Province
                            </label>
                            {isEditing ? (
                                <Select
                                    value={provinceId}
                                    onChange={setProvinceId}
                                    options={provinces.map(p => ({ value: p.id, label: p.name }))}
                                    placeholder="Select Province"
                                    bgColor="bg-subtle-grey"
                                />
                            ) : (
                                <p className="text-sm font-medium text-gray-800 py-2.5">{user.province?.name || '-'}</p>
                            )}
                        </div>

                        {/* Building (read-only, derived from department) */}
                        <div className="flex flex-col gap-1.5">
                            <label className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-wide">
                                <Building2 size={14} /> Building
                            </label>
                            <p className="text-sm font-medium text-gray-800 py-2.5">{user.department?.building?.name || '-'}</p>
                        </div>
                    </div>
                </div>


            </div>
        </DashboardLayout>
    );
};

export default Profile;
