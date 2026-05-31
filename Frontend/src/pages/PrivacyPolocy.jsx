import React from 'react';

const PrivacyPolicy = () => {
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-lg p-8 md:p-12">
        {/* Header */}
        <div className="border-b border-gray-200 pb-6 mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Privacy Policy</h1>
          <p className="text-gray-600">
            <strong>Effective Date:</strong> April 28, 2025
          </p>
          <p className="text-gray-600">
            <strong>Last Updated:</strong> January 29, 2026
          </p>
        </div>

        {/* Introduction */}
        <section className="mb-8">
          <p className="text-gray-700 leading-relaxed">
            Welcome to <strong>3Digree</strong> ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our white-label web development services through our website{' '}
            <a href="https://3digree.in" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
              3digree.in
            </a>{' '}
            (the "Service").
          </p>
          <p className="text-gray-700 leading-relaxed mt-4">
            By accessing or using our Service, you agree to the terms outlined in this Privacy Policy. If you do not agree with our policies and practices, please do not use our Service.
          </p>
        </section>

        {/* Section 1 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">1. Information We Collect</h2>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.1 Personal Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            When you subscribe to our services or contact us, we may collect the following personal information:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
            <li><strong>Name:</strong> Your full name or business name</li>
            <li><strong>Email Address:</strong> For communication and account management</li>
            <li><strong>Phone Number:</strong> For service-related inquiries and support (8741967971, 7728846516)</li>
            <li><strong>Business Information:</strong> Company name, website, and other relevant business details</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.2 Project-Related Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            To deliver our white-label web development services, we collect:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
            <li><strong>Project Requirements:</strong> Details discussed during Google Meet consultations</li>
            <li><strong>Design Files:</strong> Any design assets, wireframes, or content you provide</li>
            <li><strong>Client Data:</strong> Information about your end clients necessary to build their websites (collected only to the extent required for project delivery)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.3 Payment Information</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use <strong>Razorpay</strong> as our third-party payment processor for all transactions. We do not directly collect, store, or process your payment card details or bank account information. All payment data is handled securely by Razorpay in accordance with their privacy policy and PCI-DSS compliance standards.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            We only receive transaction confirmation details (e.g., payment status, transaction ID) from Razorpay to verify your subscription.
          </p>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">1.4 Cookies and Analytics (Future Implementation)</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            Currently, we do not use cookies or analytics tools. However, in the future, we may implement <strong>Google Analytics</strong> or similar services to:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Analyze website traffic and user behavior</li>
            <li>Improve our Service and user experience</li>
            <li>Understand how visitors interact with our website</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            If we implement cookies or analytics in the future, we will update this Privacy Policy and notify you accordingly. You will have the option to accept or decline cookies through your browser settings.
          </p>
        </section>

        {/* Section 2 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">2. How We Use Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We use the information we collect for the following purposes:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Service Delivery:</strong> To provide white-label web development services, including frontend and full-stack MERN website development</li>
            <li><strong>Communication:</strong> To respond to your inquiries, provide customer support, and send service-related updates</li>
            <li><strong>Project Management:</strong> To manage your subscription, credits, and project requirements</li>
            <li><strong>Quality Assurance:</strong> To ensure timely delivery and maintain service quality</li>
            <li><strong>Legal Compliance:</strong> To comply with applicable laws and regulations, including the Information Technology Act, 2000 (India)</li>
          </ul>
        </section>

        {/* Section 3 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">3. How We Share Your Information</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We respect your privacy and do not sell, rent, or trade your personal information to third parties. However, we may share your information in the following circumstances:
          </p>
          
          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.1 With Service Providers</h3>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
            <li><strong>Razorpay:</strong> For secure payment processing</li>
            <li><strong>Google Meet:</strong> For project consultations and communication</li>
            <li><strong>GitHub:</strong> For code delivery and version control (project files are delivered via GitHub and deleted after handover)</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.2 White-Label Service Model</h3>
          <p className="text-gray-700 leading-relaxed mb-4">
            As a white-label service provider, we operate invisibly in the background. We collect only the minimum information necessary about your end clients to complete website development. This information is:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
            <li>Used solely for project delivery</li>
            <li><strong>Deleted after delivery</strong> (we upload completed projects to GitHub and hand them over to you; we do not retain project files)</li>
            <li>Never disclosed to third parties without your explicit consent</li>
          </ul>

          <h3 className="text-xl font-semibold text-gray-800 mb-3">3.3 Legal Requirements</h3>
          <p className="text-gray-700 leading-relaxed">
            We may disclose your information if required by law, court order, or governmental authority, or to protect our legal rights and safety.
          </p>
        </section>

        {/* Section 4 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">4. Data Retention and Deletion</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We retain your personal information only as long as necessary to fulfill the purposes outlined in this Privacy Policy:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Account Information:</strong> Retained for the duration of your subscription and for legal/accounting purposes thereafter</li>
            <li><strong>Project Files:</strong> <strong>Deleted immediately after delivery</strong> via GitHub to your account. We do not store or retain your project files or your clients\' data after handover</li>
            <li><strong>Communication Records:</strong> Retained for customer support and quality assurance purposes</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            You may request deletion of your personal data by contacting us at{' '}
            <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
              info.3digree@gmail.com
            </a>
            . Please note that we may retain certain information as required by law or for legitimate business purposes.
          </p>
        </section>

        {/* Section 5 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">5. Data Security</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We implement reasonable technical and organizational measures to protect your personal information from unauthorized access, disclosure, alteration, or destruction. These measures include:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Secure communication channels (Google Meet, encrypted email)</li>
            <li>Third-party payment security via Razorpay (PCI-DSS compliant)</li>
            <li>Access controls and secure file handling practices</li>
            <li>Immediate deletion of project files after delivery</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            However, no method of transmission over the internet or electronic storage is 100% secure. While we strive to use commercially acceptable means to protect your information, we cannot guarantee absolute security.
          </p>
        </section>

        {/* Section 6 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">6. Your Rights</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Under applicable data protection laws (including the Information Technology Act, 2000, and GDPR where applicable), you have the following rights:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li><strong>Access:</strong> Request a copy of the personal information we hold about you</li>
            <li><strong>Correction:</strong> Request correction of inaccurate or incomplete information</li>
            <li><strong>Deletion:</strong> Request deletion of your personal data (subject to legal obligations)</li>
            <li><strong>Data Portability:</strong> Request transfer of your data to another service provider</li>
            <li><strong>Objection:</strong> Object to processing of your personal information for certain purposes</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            To exercise any of these rights, please contact us at{' '}
            <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
              info.3digree@gmail.com
            </a>{' '}
            or call us at <strong>8741967971</strong> or <strong>7728846516</strong>.
          </p>
        </section>

        {/* Section 7 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">7. Refund and Cancellation Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>No Refunds:</strong> All credit purchases are <strong>non-refundable</strong>. Once you purchase a subscription plan (Single Website, Growth, or Scale), credits cannot be refunded or exchanged for cash.
          </p>
          <p className="text-gray-700 leading-relaxed mb-4">
            <strong>Client Satisfaction:</strong> If you are dissatisfied with our service, you are responsible for evaluating our capabilities before committing to larger plans. We recommend:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4 mb-4">
            <li>Starting with our <strong>Single Website plan (₹4,499)</strong> to test our service quality and delivery</li>
            <li>Reviewing our 100+ client-ready templates before subscribing</li>
            <li>Contacting us at <strong>info.3digree@gmail.com</strong>, <strong>8741967971</strong>, or <strong>7728846516</strong> with any questions or concerns before purchasing</li>
          </ul>
          <p className="text-gray-700 leading-relaxed">
            We are committed to delivering high-quality white-label services. If you encounter any issues, please reach out to us immediately so we can address your concerns.
          </p>
        </section>

        {/* Section 8 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">8. Third-Party Links and Services</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            Our Service may contain links to third-party websites or services (e.g., Razorpay, Google Meet, GitHub). We are not responsible for the privacy practices or content of these third parties. We encourage you to review their privacy policies before providing any personal information.
          </p>
        </section>

        {/* Section 9 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">9. Children\'s Privacy</h2>
          <p className="text-gray-700 leading-relaxed">
            Our Service is not intended for individuals under the age of 18. We do not knowingly collect personal information from children. If you believe we have inadvertently collected information from a minor, please contact us immediately, and we will take steps to delete such information.
          </p>
        </section>

        {/* Section 10 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">10. International Data Transfers</h2>
          <p className="text-gray-700 leading-relaxed">
            Our primary operations are based in <strong>Jaipur, Rajasthan, India</strong>. If you are accessing our Service from outside India, please be aware that your information may be transferred to, stored, and processed in India. By using our Service, you consent to such transfers.
          </p>
        </section>

        {/* Section 11 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">11. Changes to This Privacy Policy</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            We may update this Privacy Policy from time to time to reflect changes in our practices, technology, legal requirements, or other factors. When we make changes, we will:
          </p>
          <ul className="list-disc list-inside text-gray-700 space-y-2 ml-4">
            <li>Update the "Last Updated" date at the top of this policy</li>
            <li>Notify you via email or through a prominent notice on our website (for material changes)</li>
          </ul>
          <p className="text-gray-700 leading-relaxed mt-4">
            We encourage you to review this Privacy Policy periodically to stay informed about how we are protecting your information.
          </p>
        </section>

        {/* Section 12 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">12. Contact Us</h2>
          <p className="text-gray-700 leading-relaxed mb-4">
            If you have any questions, concerns, or requests regarding this Privacy Policy or our data practices, please contact us:
          </p>
          <div className="bg-gray-100 p-6 rounded-lg">
            <p className="text-gray-800 font-semibold mb-2">3Digree</p>
            <p className="text-gray-700">
              <strong>Email:</strong>{' '}
              <a href="mailto:info.3digree@gmail.com" className="text-blue-600 hover:underline">
                info.3digree@gmail.com
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Phone:</strong> +91-8741967971, +91-7728846516
            </p>
            <p className="text-gray-700">
              <strong>Website:</strong>{' '}
              <a href="https://3digree.in" className="text-blue-600 hover:underline" target="_blank" rel="noopener noreferrer">
                https://3digree.in
              </a>
            </p>
            <p className="text-gray-700">
              <strong>Address:</strong> Jaipur, Rajasthan, India - 303021
            </p>
            <p className="text-gray-700 mt-2">
              <strong>Founders:</strong> Akshat Raj (Co-founder & CEO), Shreyansh Kumawat (Co-founder, CTO & CMnO)
            </p>
          </div>
        </section>

        {/* Section 13 */}
        <section className="mb-8">
          <h2 className="text-2xl font-semibold text-gray-900 mb-4">13. Governing Law</h2>
          <p className="text-gray-700 leading-relaxed">
            This Privacy Policy is governed by and construed in accordance with the laws of India, including the <strong>Information Technology Act, 2000</strong> and the <strong>Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011</strong>. Any disputes arising from this policy shall be subject to the exclusive jurisdiction of the courts in Jaipur, Rajasthan, India.
          </p>
        </section>

        {/* Footer */}
        <div className="border-t border-gray-200 pt-6 mt-8">
          <p className="text-gray-600 text-sm">
            By using our Service, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
          </p>
          <p className="text-gray-600 text-sm mt-2">
            <strong>Last Updated:</strong> January 29, 2026
          </p>
        </div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
