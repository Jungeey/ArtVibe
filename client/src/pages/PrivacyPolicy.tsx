// src/pages/PrivacyPolicy.tsx
import React from 'react';

const PrivacyPolicy: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>

      <p className="mb-4">
        At <strong>Art Vibe</strong>, we are committed to protecting your personal information and your right to privacy. This Privacy Policy explains how we collect, use, store, and protect your data when you visit or make use of our platform.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. Information We Collect</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li><strong>Personal Information:</strong> When you register, purchase, or list a product, we may collect your name, email, phone number, shipping address, and payment details.</li>
        <li><strong>Vendor Information:</strong> For vendors, we collect business details, identity verification data, and bank information for payments.</li>
        <li><strong>Usage Data:</strong> We automatically collect data such as browser type, device info, IP address, and pages visited to improve our services.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. How We Use Your Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>To process orders and transactions securely.</li>
        <li>To manage vendor accounts and product listings.</li>
        <li>To provide customer support and respond to inquiries.</li>
        <li>To improve our platform’s performance, security, and user experience.</li>
        <li>To send order updates, notifications, and promotional messages (only with your consent).</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Sharing of Information</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>We do not sell or rent your personal information to third parties.</li>
        <li>We may share data with service providers (e.g., payment processors, delivery partners) necessary to operate the platform.</li>
        <li>We may disclose information when required by law or to protect our rights.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Cookies and Tracking</h2>
      <p className="mb-4">
        We use cookies and similar technologies to track activity on our website and hold certain information. You can choose to disable cookies in your browser settings, but this may affect site functionality.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Data Security</h2>
      <p className="mb-4">
        We take appropriate measures to protect your personal data from unauthorized access, loss, or misuse. However, no method of transmission over the internet is 100% secure.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Your Rights</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>You can access, update, or delete your personal information at any time from your account dashboard.</li>
        <li>You have the right to opt out of marketing communications.</li>
        <li>For data-related concerns, you can contact us directly.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Third-Party Links</h2>
      <p className="mb-4">
        Our platform may contain links to third-party websites. We are not responsible for the privacy practices or content of those sites.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Children's Privacy</h2>
      <p className="mb-4">
        Art Vibe is not intended for users under the age of 13. We do not knowingly collect data from children. If we learn we have collected personal data from a child, we will take steps to delete it.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">9. Changes to This Policy</h2>
      <p className="mb-4">
        We may update this Privacy Policy from time to time. Any changes will be posted here, and if significant, we will notify you through email or the platform.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">10. Contact Us</h2>
      <p>
        If you have any questions or requests regarding this Privacy Policy, please contact us at:{' '}
        <a href="mailto:privacy@artvibe.com" className="text-blue-600 hover:underline">privacy@artvibe.com</a>
      </p>
    </div>
  );
};

export default PrivacyPolicy;
