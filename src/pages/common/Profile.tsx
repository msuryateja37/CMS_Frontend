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
    Pencil,
    Save,
    X,
    CheckCircle2,
    Loader2
} from 'lucide-react';

const Profile: React.FC = () => {
    const { user, refreshUser } = useAuthStore();
    const [isEditing, setIsEditing] = useState(false);
    const [saving, setSaving] = useState(false);
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

    const handleSave = async () => {
        setSaving(true);
        setError(null);
        try {
            await authService.updateProfile({
                fullName,
                phone,
                provinceId: provinceId || undefined,
                departmentId: departmentId || undefined,
            });
            await refreshUser();
            setIsEditing(false);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err: any) {
            setError(err?.response?.data?.message || 'Failed to update profile');
        } finally {
            setSaving(false);
        }
    };

    const handleCancel = () => {
        if (user) {
            setFullName(user.fullName || '');
            setPhone(user.phone || '');
            setProvinceId(user.province?.id || '');
            setDepartmentId(user.department?.id || '');
        }
        setIsEditing(false);
        setError(null);
    };

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

    return (
        <DashboardLayout
            title="My Profile"
            description="Profile"
            breadcrumbs={[{ label: "Dashboard" }, { label: "Profile" }]}
        >
            <div className="max-w-3xl mx-auto flex flex-col gap-6">
                {/* Success Banner */}
                {success && (
                    <div className="flex items-center gap-3 bg-light-green border border-green/20 text-dark-green px-4 py-3 rounded-xl animate-fadeIn">
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
                    <div className="h-28 bg-gradient-to-r from-dark-green to-green"></div>

                    <div className="px-8 pb-8">
                        {/* Avatar overlapping banner */}
                        <div className="flex flex-col sm:flex-row items-center sm:items-end gap-4 -mt-12">
                            <div className="w-24 h-24 rounded-full bg-green flex items-center justify-center text-white font-bold text-3xl shadow-lg border-4 border-white">
                                {getUserInitials()}
                            </div>
                            <div className="flex-1 text-center sm:text-left pb-1">
                                <h2 className="text-xl font-bold text-gray-800">{user.fullName}</h2>
                                <p className="text-sm text-gray-500">{formatRole(user.role?.name)}</p>
                            </div>
                            {!isEditing ? (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="flex items-center gap-2 px-5 py-2.5 bg-dark-green text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm shadow-sm"
                                >
                                    <Pencil size={16} />
                                    Edit Profile
                                </button>
                            ) : (
                                <div className="flex gap-2">
                                    <button
                                        onClick={handleCancel}
                                        className="flex items-center gap-2 px-4 py-2.5 bg-gray-100 text-gray-600 font-semibold rounded-lg hover:bg-gray-200 transition-all text-sm"
                                    >
                                        <X size={16} />
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleSave}
                                        disabled={saving}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-green text-white font-semibold rounded-lg hover:bg-opacity-90 transition-all text-sm shadow-sm disabled:opacity-50"
                                    >
                                        {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                        {saving ? 'Saving...' : 'Save Changes'}
                                    </button>
                                </div>
                            )}
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
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green transition-all"
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
                                    className="px-4 py-2.5 bg-subtle-grey border border-gray-200 rounded-lg text-sm text-gray-800 font-medium focus:outline-none focus:ring-2 focus:ring-green/20 focus:border-green transition-all"
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
                                <span className="inline-flex items-center px-3 py-1 bg-light-green text-dark-green text-xs font-bold rounded-full">
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
