import React from 'react';

const SpeedoPitchPrivacy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-lg text-gray-700 mb-1">Speed o Pitch</p>
          <p className="text-gray-600">
            <strong>Last updated:</strong> September 15, 2026
          </p>
        </div>

        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            3Digree ("we", "us", or "our") operates the <strong>Speed o Pitch</strong> mobile application (the "App"). This Privacy Policy explains how we collect, use, and protect your information when you use our App.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">a) Account Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you sign in using Google Sign-In or email, we collect your name, email address, and profile picture. This is used to identify your account and manage your subscription status.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">b) Subscription Data</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We store whether your account has an active premium subscription. This data is stored securely on our servers (Supabase).
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">c) Audio Files</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Audio and video files you import are stored locally on your device only. We do not upload, access, or store your audio files on any server.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">d) Advertising Data</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use Google AdMob to display advertisements. AdMob may collect device identifiers, IP address, and ad interaction data. This data is collected by Google and is subject to{' '}
            <a href="https://policies.google.com/privacy" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              Google's Privacy Policy
            </a>.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">e) Usage Data</h3>
          <p className="text-gray-700 leading-relaxed">
            We do not collect analytics or usage tracking data beyond what Google AdMob collects for ad serving purposes.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>To provide and maintain your account</li>
            <li>To manage your premium subscription status</li>
            <li>To display advertisements via Google AdMob</li>
            <li>To improve the App experience</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. Data Storage and Security</h2>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Account and subscription data is stored on Supabase with row-level security enabled.</li>
            <li>Audio files remain on your device and are never uploaded to our servers.</li>
            <li>We use industry-standard security measures to protect your data.</li>
          </ul>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Third-Party Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our App uses the following third-party services:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Google Sign-In (authentication)</li>
            <li>Google AdMob (advertising)</li>
            <li>Google Play Billing (subscriptions)</li>
            <li>Supabase (account data storage)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            Each of these services has their own privacy policy governing how they handle your data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Children's Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our App is not directed at children under 13. We do not knowingly collect personal information from children under 13. If you are a parent and believe your child has provided us with personal information, please contact us.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Data Deletion</h2>
          <p className="text-gray-700 leading-relaxed">
            You can request deletion of your account data by contacting us at{' '}
            <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
              info.3digree@gmail.com
            </a>. Uninstalling the App will remove all locally stored audio files and project data.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Changes to This Policy</h2>
          <p className="text-gray-700 leading-relaxed">
            We may update this Privacy Policy from time to time. We will notify you of any changes by updating the "Last updated" date at the top of this page.
          </p>
        </section>

        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Contact Us</h2>
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
            By using our App, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SpeedoPitchPrivacy;
