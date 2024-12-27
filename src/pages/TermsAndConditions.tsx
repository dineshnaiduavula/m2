import { ArrowLeft } from 'lucide-react';
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const TermsAndConditions: React.FC = () => {
     const navigate = useNavigate();
    useEffect(() => {
        // Scroll to the top of the page when the component is mounted
        window.scrollTo(0, 0);
      }, []);
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"> 
      {/* Fixed position for the Back to Payment button */}
        <button
          onClick={() => navigate('/payment')}
          className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="w-5 h-5" />
          <span className="text-red-600">Back to Payment</span>
        </button>

     <div className="p-6 m-4 border border-gray-300 rounded-lg bg-white shadow-sm">
      {/* Replace with your actual terms and conditions */}
      <p className="text-gray-600 text-sm">
        <span style={{ fontWeight: 'bold' }}>OVERVIEW </span>
        <br /><br />
        This website is operated by TAPONBYTES COMMUNICATIONS PRIVATE LIMITED. Throughout the site, the terms “we”, “us” and “our” refer to TAPONBYTES COMMUNICATIONS PRIVATE LIMITED, which is a third party managing these processes on behalf of G3 THEATRES LLP. TAPONBYTES COMMUNICATIONS PRIVATE LIMITED offers this website, including all information, tools, and services available from this site to you, the user, conditioned upon your acceptance of all terms, conditions, policies, and notices stated here.
        <br />By visiting our site and/or purchasing something from us, you engage in our “Service” and agree to be bound by the following Terms and Conditions. These Terms and Conditions apply to all users of the site, including without limitation users who are browsers, customers, merchants, and/or contributors of content.
        <br />
        <ul>
          <li>Please read these Terms and Conditions carefully before accessing or using our website. By accessing or using any part of the site, you agree to be bound by these Terms and Conditions.</li>
          <li>If you do not agree to all the terms and conditions of this agreement, then you may not access the payment or use any services.</li>
          <li>Any new features or tools which are added to the current store shall also be subject to the terms and conditions. You can review the most current version of the Terms and Conditions at any time on this page.</li>
          <li>We reserve the right to update, change, or replace any part of these Terms and Conditions by posting updates and/or changes to our website. It is your responsibility to check this page periodically for changes.</li>
          <li>Your continued use of or access to the website following the posting of any changes constitutes acceptance of those changes.</li>
        </ul>
        <br />
        <span style={{ fontWeight: 'bold' }}>Terms and Conditions</span>
      </p>
      <p className="text-gray-600 text-sm mt-4">
        <span style={{ fontWeight: '500' }}>1. Pricing Policy</span><br />
        All prices displayed on the website are exclusive of applicable taxes and fees. The total bill will include the following charges:
        <ul>
          <li>Handling Fee: 4% (charged by us as the third party responsible for website development, maintenance, and account handling).</li>
        </ul>
        <br />
        <span style={{ fontWeight: '500' }}>2. What We Do with Your Information</span><br />
        When you purchase something through this platform, as part of the process, we collect personal information such as your name, phone number, seat number, and screen. This information is used solely to facilitate your order and ensure efficient handling. Note that we are a third party managing these processes on behalf of G3 THEATRES LLP.
        <br /><br />
        <span style={{ fontWeight: '500' }}>3. Payee Information</span><br />
        All payments made on this platform are directed to G3 THEATRES LLP. We act only as a service provider for facilitating these transactions.
        <br /><br />
        <span style={{ fontWeight: '500' }}>4. Payment Methods</span><br />
        Payments are processed through Phonepe. Neither we nor Phonepe store your card data on their servers. Payment data is encrypted through the Payment Card Industry Data Security Standard (PCI-DSS) during processing. Your purchase transaction data is used only as necessary to complete the transaction and is not retained thereafter.
        <br />
        Our payment gateway adheres to PCI-DSS standards managed by the PCI Security Standards Council, which includes brands like Visa, MasterCard, and American Express. These standards ensure secure handling of credit card information by our platform and service providers.
        <br /><br />
        <span style={{ fontWeight: '500' }}>5. Transaction Confirmation</span><br />
        After a successful transaction, you will receive an order and payment confirmation on the webpage. Please ensure that the details provided are accurate.
        <br /><br />
        <span style={{ fontWeight: '500' }}>6. Food Items: Health and Safety</span><br />
        All food items listed on the website adhere to strict health and safety standards. Food is sourced from trusted suppliers to ensure quality and compliance with regulations. Customers with specific allergies or dietary restrictions are advised to review item details carefully before placing an order.
        <br /><br />
        <span style={{ fontWeight: '500' }}>7. Ownership of Food Items</span><br />
        The ownership and responsibility for the preparation and quality of food items lie solely with G3 THEATRES LLP or their associated partners. Any issues related to food preparation or quality should be addressed directly with the management of G3 THEATRES LLP.
        <br /><br />
        <span style={{ fontWeight: '500' }}>8. Privacy and Protection of Information</span><br />
        To protect your personal information, we implement reasonable precautions and industry best practices to ensure it is not inappropriately lost, misused, accessed, disclosed, altered, or destroyed. All personal and payment information provided during the ordering process is handled securely and used solely for completing transactions and improving the user experience. As a third party, we act as custodians of this data for website functionality and account handling purposes.
        <br /><br />
        <span style={{ fontWeight: '500' }}>9. Refund and Cancellation Policy</span><br />
        Once an order is placed, it cannot be canceled or refunded.
        <br /><br />
        <span style={{ fontWeight: '500' }}>10. Taxes and Fees</span><br />
        Any additional taxes or fees applicable at the time of purchase will be clearly indicated in your order summary before checkout.
        <br /><br />
        <span style={{ fontWeight: '500' }}>11. Dispute Resolution</span><br />
        For any payment disputes, quality concerns, or queries, please contact the support team. We strive to address all concerns promptly. Note that we act only as facilitators and may redirect specific queries to G3 THEATRES LLP as needed.
        <br /><br />
        <span style={{ fontWeight: '500' }}>12. Changes to This Privacy Policy</span><br />
        We reserve the right to modify this privacy policy at any time. Changes and clarifications take effect immediately upon posting on the website. If material changes are made, we will notify you here. If the platform is acquired or merged with another company, your information may be transferred to ensure continuity of services.
        <br /><br />
        <span style={{ fontWeight: '500' }}>13. Acknowledgment</span><br />
        By placing an order and completing the payment, you acknowledge and accept these terms and conditions, including the role of the third-party service provider managing website development, maintenance, and account handling.
        <br /><br />
        Contact: 9346917375 <br />
        Email: harigepl@gmail.com <br />
        Address: Raj Yuvraj(G3 THEATRES), Andra Ratna Road, Gandhi Nagar, Vijayawada, Andhra Pradesh, 520010, India
        <br />
      </p>
    </div>
    </div>
  );
};

export default TermsAndConditions;
