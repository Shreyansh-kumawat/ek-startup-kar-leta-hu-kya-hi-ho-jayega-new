import React from 'react';

const WhatAMarkPrivacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-lg text-gray-700 mb-1">What-a-Mark</p>
          <p className="text-gray-600">
            <strong>Last updated:</strong> September 25, 2026
          </p>
        </div>

        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            3Digree ("we", "our", "us") built the <strong>What-a-Mark</strong> app as a free, ad-supported application. This page informs you of our policies regarding the collection, use, and disclosure of information when you use our app.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Information We Collect</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            What-a-Mark does not require you to create an account or sign in. We do not collect your name, email address, phone number, or any other personal information.
          </p>
          <p className="text-gray-700 leading-relaxed">
            The app processes images and PDF files entirely on your device. Your photos and documents are never uploaded to our servers.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Advertising</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use Google AdMob to display advertisements. AdMob may collect and use certain data to serve personalized or non-personalized ads, including:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Device identifiers (Advertising ID)</li>
            <li>IP address (approximate location)</li>
            <li>App usage data</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            For more information on how Google uses data, visit{' '}
            <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              https://policies.google.com/privacy
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">In-App Purchases</h2>
          <p className="text-gray-700 leading-relaxed">
            What-a-Mark offers optional premium features through Google Play Billing. Payment processing is handled entirely by Google Play. We do not collect or store any payment information.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Permissions</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            The app requests the following permissions:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Storage / Media access</strong> — to read images you select and save watermarked files to your device</li>
            <li><strong>Camera</strong> — to capture photos directly for watermarking (only when you choose this option)</li>
            <li><strong>Internet</strong> — to display advertisements</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Data Retention</h2>
          <p className="text-gray-700 leading-relaxed">
            Since we do not collect personal data, there is no data to retain. All image and PDF processing happens locally on your device.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Account Deletion</h2>
          <p className="text-gray-700 leading-relaxed">
            What-a-Mark does not require user accounts. If account-based features are added in the future, you can request deletion at{' '}
            <a href="https://3digree.in/whatamark/delete-account" className="text-blue-600 hover:underline">
              https://3digree.in/whatamark/delete-account
            </a>.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            This app is not directed at children under 13. We do not knowingly collect information from children.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated date.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have questions about this Privacy Policy, contact us at:
          </p>
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

        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-600 text-sm">
            By using our app, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default WhatAMarkPrivacy;
