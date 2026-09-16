import React from 'react';

const SpeedoPitchDeleteAccount = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Delete Your Account</h1>
          <p className="text-lg text-gray-700">Speed o Pitch</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">How to delete your Speed o Pitch account:</h2>
          <ol className="list-decimal list-inside text-gray-700 space-y-3 ml-4">
            <li>Send an email to{' '}
              <a href="mailto:info.3digree@gmail.com?subject=Delete%20My%20Account" className="text-blue-600 hover:underline">
                info.3digree@gmail.com
              </a>{' '}
              with subject <strong>"Delete My Account"</strong>
            </li>
            <li>Include the email address you used to sign up</li>
            <li>We will delete your account and all associated data within <strong>7 business days</strong></li>
          </ol>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data that will be deleted:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Your account (email, user ID)</li>
            <li>Premium status records</li>
            <li>All data stored on our servers</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data NOT stored on our servers:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Your audio files (stored locally on your device only)</li>
            <li>App preferences (stored locally on your device only)</li>
          </ul>
        </section>

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-600 text-sm">
            If you have any questions, contact us at{' '}
            <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
              info.3digree@gmail.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedoPitchDeleteAccount;
