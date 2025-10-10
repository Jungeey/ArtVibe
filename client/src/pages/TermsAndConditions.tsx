import React from 'react';

const TermsAndConditions: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto px-4 py-10 text-gray-800">
      <h1 className="text-3xl font-bold mb-6">Terms and Conditions</h1>

      <p className="mb-4">
        Welcome to <strong>Art Vibe</strong>, a multi-vendor platform dedicated to promoting and selling authentic Nepali goods including paintings, handicrafts, traditional artworks, and more. These Terms and Conditions govern your access to and use of the Art Vibe website and services. By using our platform, you agree to comply with and be bound by the following terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">1. General</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Art Vibe is an online marketplace connecting buyers with independent Nepali vendors and artists.</li>
        <li>We act as a facilitator and are not directly involved in the transactions between buyers and sellers.</li>
        <li>All users must be at least 18 years old or have parental/guardian consent to use the platform.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">2. Vendor Responsibilities</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Vendors are solely responsible for the accuracy, quality, and legality of the products they list.</li>
        <li>All products must be original, authentic, and comply with Nepali cultural and legal standards.</li>
        <li>Vendors are required to fulfill orders in a timely and professional manner.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">3. Buyer Responsibilities</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Buyers are responsible for providing accurate shipping and contact information.</li>
        <li>By placing an order, the buyer agrees to pay the listed price and any applicable fees.</li>
        <li>Disputes regarding orders should first be addressed directly with the vendor.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">4. Payments and Fees</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Payments are processed securely through our integrated payment gateways.</li>
        <li>Art Vibe may charge a service or commission fee from vendors for each transaction.</li>
        <li>Fees are subject to change with prior notice.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">5. Intellectual Property</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>All content on Art Vibe, including logos, designs, and product images, are protected by copyright and trademark laws.</li>
        <li>Vendors retain rights to their own artwork but grant Art Vibe a license to display and market the content on the platform.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">6. Termination</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Art Vibe reserves the right to suspend or terminate user accounts that violate these terms or misuse the platform.</li>
        <li>Users may terminate their account at any time through their dashboard or by contacting support.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">7. Limitation of Liability</h2>
      <ul className="list-disc pl-6 space-y-2">
        <li>Art Vibe is not liable for any direct or indirect damages arising from the use of the platform.</li>
        <li>We do not guarantee continuous, uninterrupted access to the site.</li>
      </ul>

      <h2 className="text-2xl font-semibold mt-6 mb-2">8. Changes to Terms</h2>
      <p className="mb-4">
        Art Vibe reserves the right to modify these Terms and Conditions at any time. Updates will be posted on this page. Continued use of the platform after changes indicates acceptance of the new terms.
      </p>

      <h2 className="text-2xl font-semibold mt-6 mb-2">9. Contact Us</h2>
      <p>
        If you have any questions or concerns about these Terms and Conditions, please contact us at{' '}
        <a href="mailto:support@artvibe.com" className="text-blue-600 hover:underline">support@artvibe.com</a>.
      </p>
    </div>
  );
};

export default TermsAndConditions;
