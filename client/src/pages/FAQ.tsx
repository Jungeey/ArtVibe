// src/pages/FAQ.tsx
import React, { useState } from 'react';
import { ChevronDownIcon, ChevronUpIcon } from '@heroicons/react/24/outline';

const FAQ: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: 'What is Art Vibe?',
      answer:
        'Art Vibe is a multi-vendor e-commerce platform that connects buyers with Nepali artists, crafters, and vendors offering authentic handmade goods like paintings, woodcrafts, textiles, pottery, and more.',
    },
    {
      question: 'How do I place an order?',
      answer:
        'Browse the product listings, add desired items to your cart, and proceed to checkout. You\'ll be guided to enter your shipping details and complete payment securely.',
    },
    {
      question: 'Are all products authentic and handmade?',
      answer:
        'Yes. We work exclusively with trusted Nepali vendors and artisans who specialize in original, handmade, and culturally significant goods.',
    },
    {
      question: 'Can I become a vendor on Art Vibe?',
      answer:
        'Absolutely! If you\'re a Nepali artist or craftsperson, you can register as a vendor on our platform. After verification, you\'ll be able to list and sell your products online.',
    },
    {
      question: 'What payment methods are accepted?',
      answer:
        'We support various payment methods including eSewa, Khalti, bank transfers, and major debit/credit cards. All payments are processed securely.',
    },
    {
      question: 'How is shipping handled?',
      answer:
        'Each vendor manages their own shipping. Delivery timelines and shipping fees may vary depending on the seller\'s location and the customer\'s address.',
    },
    {
      question: 'What if I receive a damaged or wrong item?',
      answer:
        'Please contact the vendor directly through your order page. If the issue is unresolved, you can open a support request with Art Vibe for mediation.',
    },
    {
      question: 'Is there a return or refund policy?',
      answer:
        'Return and refund policies are set by individual vendors. Please review the seller\'s policy before purchasing. If a refund is approved, it will be processed to your original payment method.',
    },
    {
      question: 'How do I contact Art Vibe support?',
      answer:
        'You can reach out to our support team via email at support@artvibe.com or use the contact form on the website.',
    },
  ];

  const toggleFAQ = (index: number) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Frequently Asked Questions
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Find quick answers to common questions about Art Vibe. 
            Can't find what you're looking for?{' '}
            <a 
              href="/contact" 
              className="text-amber-600 hover:text-amber-700 font-medium underline transition-colors"
            >
              Contact our support team
            </a>
          </p>
        </div>

        {/* FAQ Items */}
        <div className="space-y-4">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-sm hover:shadow-md transition-all duration-300 border border-gray-100 overflow-hidden"
            >
              <button
                onClick={() => toggleFAQ(index)}
                className="w-full px-6 py-5 text-left flex justify-between items-center focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-opacity-50 rounded-2xl"
              >
                <h2 className="text-lg font-semibold text-gray-900 pr-4">
                  {faq.question}
                </h2>
                <div className="flex-shrink-0 ml-2">
                  {openIndex === index ? (
                    <ChevronUpIcon className="w-5 h-5 text-amber-600" />
                  ) : (
                    <ChevronDownIcon className="w-5 h-5 text-amber-600" />
                  )}
                </div>
              </button>
              
              <div
                className={`px-6 transition-all duration-300 ease-in-out ${
                  openIndex === index 
                    ? 'pb-5 opacity-100 max-h-96' 
                    : 'pb-0 opacity-0 max-h-0'
                }`}
              >
                <div className="border-t border-gray-100 pt-4">
                  <p className="text-gray-700 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Additional Help Section */}
        <div className="mt-16 text-center bg-white rounded-2xl p-8 shadow-sm border border-gray-100">
          <h3 className="text-2xl font-bold text-gray-900 mb-4">
            Still have questions?
          </h3>
          <p className="text-gray-600 mb-6 max-w-md mx-auto">
            Our support team is here to help you with any other questions you might have.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/contact"
              className="inline-flex items-center px-6 py-3 border border-transparent text-base font-medium rounded-lg text-white bg-amber-600 hover:bg-amber-700 transition-colors duration-200 shadow-sm"
            >
              Contact Support
            </a>
            {/* <a
              href="/support"
              className="inline-flex items-center px-6 py-3 border border-gray-300 text-base font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 transition-colors duration-200"
            >
              Visit Help Center
            </a> */}
          </div>
        </div>
      </div>
    </div>
  );
};

export default FAQ;