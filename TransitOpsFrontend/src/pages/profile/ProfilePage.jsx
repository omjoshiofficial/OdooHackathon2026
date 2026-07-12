import { useState } from 'react';
import { Camera, Save, Lock, Bell } from 'lucide-react';
import { toast } from 'react-toastify';
import { authApi } from '../../api/authApi';
import { useAuth } from '../../context/AuthContext';
import PageHeader from '../../components/common/PageHeader';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { formatDate } from '../../utils';

const ProfilePage = () => {
  const { user, updateUser } = useAuth();
  const [profileForm, setProfileForm] = useState({ name: user?.name || '', phone: user?.phone || '', department: user?.department || '' });
  const [notifications, setNotifications] = useState(user?.notifications || { email: true, push: true, sms: false });
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' });
  const [saving, setSaving] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await authApi.updateProfile({ ...user, ...profileForm, notifications });
      updateUser({ ...profileForm, notifications });
      toast.success('Profile updated.');
    } catch { toast.error('Update failed.'); } finally { setSaving(false); }
  };

  const handlePasswordSave = async () => {
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('Passwords do not match.');
      return;
    }
    if (passwordForm.newPassword.length < 6) {
      toast.error('Password must be at least 6 characters.');
      return;
    }
    setSavingPassword(true);
    try {
      await authApi.changePassword(passwordForm);
      toast.success('Password changed.');
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to change password.');
    } finally { setSavingPassword(false); }
  };

  const initials = user?.name?.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="page-container">
      <PageHeader title="Profile" subtitle="Manage your account" breadcrumbs={[{ label: 'Profile' }]} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Avatar & Info */}
        <div className="card p-6 flex flex-col items-center text-center">
          <div className="relative mb-4">
            <div className="w-20 h-20 rounded-full gradient-brand flex items-center justify-center text-white text-2xl font-bold">
              {initials}
            </div>
            <button className="absolute bottom-0 right-0 w-7 h-7 rounded-full bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 flex items-center justify-center shadow-sm hover:shadow-md">
              <Camera size={13} className="text-gray-500" />
            </button>
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-gray-100">{user?.name}</h2>
          <p className="text-sm text-primary-600 dark:text-primary-400 font-medium">{user?.role}</p>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{user?.email}</p>
          <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 w-full space-y-2 text-left">
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Department</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{user?.department}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-gray-500 dark:text-gray-400">Joined</span>
              <span className="font-medium text-gray-700 dark:text-gray-300">{formatDate(user?.joinedAt)}</span>
            </div>
          </div>
        </div>

        {/* Edit Profile */}
        <div className="lg:col-span-2 space-y-4">
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Save size={15} className="text-primary-500" /> Personal Information
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input label="Full Name" value={profileForm.name} onChange={(e) => setProfileForm((p) => ({ ...p, name: e.target.value }))} />
              <Input label="Phone" value={profileForm.phone} onChange={(e) => setProfileForm((p) => ({ ...p, phone: e.target.value }))} />
              <Input label="Department" value={profileForm.department} onChange={(e) => setProfileForm((p) => ({ ...p, department: e.target.value }))} />
              <Input label="Email" value={user?.email} disabled className="opacity-60" />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handleProfileSave} loading={saving}>Save Changes</Button>
            </div>
          </div>

          {/* Notifications */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Bell size={15} className="text-primary-500" /> Notification Preferences
            </h3>
            <div className="space-y-3">
              {Object.entries(notifications).map(([key, val]) => (
                <label key={key} className="flex items-center justify-between cursor-pointer">
                  <span className="text-sm text-gray-700 dark:text-gray-300 capitalize">{key} Notifications</span>
                  <div
                    onClick={() => setNotifications((p) => ({ ...p, [key]: !p[key] }))}
                    className={`relative w-10 h-5 rounded-full transition-colors cursor-pointer ${val ? 'bg-primary-600' : 'bg-gray-200 dark:bg-gray-700'}`}
                  >
                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-transform ${val ? 'translate-x-5' : 'translate-x-0.5'}`} />
                  </div>
                </label>
              ))}
            </div>
          </div>

          {/* Change Password */}
          <div className="card p-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-200 mb-4 flex items-center gap-2">
              <Lock size={15} className="text-primary-500" /> Change Password
            </h3>
            <div className="space-y-3">
              <Input label="Current Password" type="password" value={passwordForm.currentPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, currentPassword: e.target.value }))} />
              <Input label="New Password" type="password" value={passwordForm.newPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, newPassword: e.target.value }))} />
              <Input label="Confirm New Password" type="password" value={passwordForm.confirmPassword} onChange={(e) => setPasswordForm((p) => ({ ...p, confirmPassword: e.target.value }))} />
            </div>
            <div className="mt-4 flex justify-end">
              <Button onClick={handlePasswordSave} loading={savingPassword}>Update Password</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
