import React from 'react';

const WhatAMarkDeleteAccount = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Delete Account</h1>
          <p className="text-lg text-gray-700">What-a-Mark</p>
        </div>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Request Account Deletion</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you would like to delete your What-a-Mark account and all associated data, please send an email to:
          </p>
          <div className="bg-gray-100 p-6 rounded-lg mb-4">
            <p className="text-gray-800">
              <strong>Email:</strong>{' '}
              <a
                href="mailto:shreyanshraj.kumawat@gmail.com?subject=Delete%20My%20What-a-Mark%20Account"
                className="text-blue-600 hover:underline"
              >
                shreyanshraj.kumawat@gmail.com
              </a>
            </p>
            <p className="text-gray-800 mt-2">
              <strong>Subject:</strong> Delete My What-a-Mark Account
            </p>
          </div>
          <p className="text-gray-700 leading-relaxed">
            Please include the Gmail address you used to sign in to the app.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">What happens when you request deletion:</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Your account and profile information will be permanently deleted</li>
            <li>Your premium subscription status will be removed</li>
            <li>All data associated with your account will be erased from our servers</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Your request will be processed within <strong>7 business days</strong>. You will receive a confirmation email once your account has been deleted.
          </p>
        </section>

        <section className="mb-8">
          <div className="bg-blue-50 border-l-4 border-[#6498fe] p-5 rounded-r-lg">
            <p className="text-gray-700 leading-relaxed">
              <strong>Note:</strong> Deleting your account does not cancel any active Google Play subscriptions. To cancel a subscription, go to <strong>Google Play Store → Menu → Subscriptions</strong>.
            </p>
          </div>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
                info.3digree@gmail.com
              </a>
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Website:</strong>{' '}
              <a href="https://3digree.in" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                https://3digree.in
              </a>
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default WhatAMarkDeleteAccount;
