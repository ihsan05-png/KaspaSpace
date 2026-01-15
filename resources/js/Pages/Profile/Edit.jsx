import { Head } from '@inertiajs/react';
import Navbar from '@/Components/Navbar';
import Footer from '@/Components/Footer';
import DeleteUserForm from './Partials/DeleteUserForm';
import UpdatePasswordForm from './Partials/UpdatePasswordForm';
import UpdateProfileInformationForm from './Partials/UpdateProfileInformationForm';

export default function Edit({ mustVerifyEmail, status }) {
    return (
        <>
            <Head title="Profile" />
            <Navbar />

            <div className="min-h-screen bg-gray-50 py-12">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-gray-900">Profil Saya</h1>
                        <p className="mt-2 text-sm text-gray-600">
                            Kelola informasi profil dan keamanan akun Anda
                        </p>
                    </div>

                    <div className="space-y-6">
                        <div className="bg-white p-4 shadow rounded-lg sm:p-8">
                            <UpdateProfileInformationForm
                                mustVerifyEmail={mustVerifyEmail}
                                status={status}
                                className="max-w-xl"
                            />
                        </div>

                        <div className="bg-white p-4 shadow rounded-lg sm:p-8">
                            <UpdatePasswordForm className="max-w-xl" />
                        </div>

                        <div className="bg-white p-4 shadow rounded-lg sm:p-8">
                            <DeleteUserForm className="max-w-xl" />
                        </div>
                    </div>
                </div>
            </div>

            <Footer />
        </>
    );
}
