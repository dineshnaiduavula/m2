import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useStore } from '../store/useStore';
import { useMenuStore } from '../store/menuStore';
import { usePaymentStore } from '../store/paymentStore';
import { ArrowLeft, CreditCard } from 'lucide-react';
import toast from 'react-hot-toast';
import axios from 'axios';
import CryptoJS from 'crypto-js';
import { collection, addDoc, doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../lib/firebase';
import LoadingSpinner from '../components/LoadingSpinner';

declare global {
  interface Window {
    phonepe: any;
  }
}
const Payment = () => {
  const [paymentStatus, setPaymentStatus] = useState<string | null>(null); // State to track payment status
    const [loading, setLoading] = useState(false); // State for loading indicator
  
  const navigate = useNavigate();
  const { cart, name, phone, seatNumber, clearCart, removeFromCart, screen } = useStore();
  const { items: menuItems, startRealTimeUpdates } = useMenuStore();
  const [isProcessing, setIsProcessing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const toggleModal = () => setIsModalOpen(!isModalOpen);

  useEffect(() => {
    const unsubscribe = startRealTimeUpdates();
    return () => unsubscribe();
  }, []);

  const calculateTotal = () => {
    const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
    const handlingCharges = subtotal * 0.04;
    return subtotal + handlingCharges;
  };

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);

    const totalAmount = calculateTotal();
   ///
   const data = {
    name,
    amount: totalAmount,
    number: phone,
    MUID: 'MUID' + Date.now(),
    transactionId: 'T' + Date.now(),
  };
    const salt_key = process.env.REACT_APP_SALT_KEY || '96434309-7796-489d-8924-ab56988a6076';
    const merchant_id = process.env.REACT_APP_MERCHANT_ID || 'PGTESTPAYUAT86';

    const payload = JSON.stringify({
      merchantId: merchant_id,
      merchantTransactionId: data.transactionId,
      merchantUserId: data.MUID,
      name: data.name,
      amount: totalAmount * 100, // Amount in paise,
     redirectUrl: `${window.location.origin}/order-confirmation`,
    //  redirectUrl:'http://localhost:5173/order-confirmation',
      redirectMode: 'POST',
      mobileNumber: data.number,
      paymentInstrument: {
        type: 'PAY_PAGE',
      },
    });

    const payloadMain = btoa(payload); // Base64 encode the payload
    const keyIndex = 1;
    const checksumString = `${payloadMain}/pg/v1/pay${salt_key}`;

    // Generate SHA256 hash using crypto-js
    const hash = CryptoJS.SHA256(checksumString).toString(CryptoJS.enc.Hex);
    const checksum = `${hash}###${keyIndex}`;

    const prod_URL = 'https://api-preprod.phonepe.com/apis/pg-sandbox/pg/v1/pay'; // Removed CORS proxy

    try {
      const res = await axios.post(
        prod_URL,
        { request: payloadMain },
        {
          headers: {
            accept: 'application/json',
            'Content-Type': 'application/json',
            'X-VERIFY': checksum,
          },
        }
      );

      if (res.data && res.data.data.instrumentResponse.redirectInfo.url) {

//adding s=doc in data base
const docRef =doc(db, "/orderId/UGm0lsQRJenIc2bAhRJX");
const docalldata = await getDoc(docRef);
console.log(docalldata)
const docdata=docalldata.data();
const currentDate = new Date().toISOString().split('T')[0];
const docDate = docdata.date ? docdata.date.split('T')[0] : ''; // Assuming you store the date in `date` field
let newId = 1;
if (docDate === currentDate && docdata.id !== undefined) {
  newId = docdata.id + 1;} else {newId = 1;}
  console.log(newId)
await updateDoc(docRef, {id: newId, date: currentDate,});

        await addDoc(collection(db, 'orders'), {
          items: cart, total: totalAmount,
          customerName: name, customerPhone: phone,
          seatNumber, status: 'pending',  screen,
         orderId:newId,
          createdAt: new Date().toISOString()
        });

        ////adding the session storage
const  user={items: cart, total: totalAmount, customerName: name, customerPhone: phone,
  seatNumber, screen, orderId:newId,
     createdAt: new Date().toISOString()}
  const existingUsers = JSON.parse(localStorage.getItem('users') || '[]');
  existingUsers.push(user);
  localStorage.setItem('users', JSON.stringify(existingUsers));
     clearCart();

        window.location.href = res.data.data.instrumentResponse.redirectInfo.url;
       // window.open(res.data.data.instrumentResponse.redirectInfo.url, '_blank', 'width=800,height=600');
      localStorage.setItem('transactionId',data.transactionId);
        toast.success('Payment initiated successfully! Redirecting...');


      } else {
        toast.error('Failed to initiate payment. Try again.');
      }
    } catch (error) {
      console.error('Payment initiation error:', error);
      toast.error('Error initiating payment');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    
    <div className="min-h-screen bg-gray-100">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center mb-8">
          <button
            onClick={() => navigate('/cart')}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="w-5 h-5" />
            <span>Back to Cart</span>
          </button>
        </div>

        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6">Payment Details</h2>

            <div className="space-y-6">
              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-2">Order Summary</h3>
                <div className="space-y-2">
                  {cart.map((item) => (
                    <div key={item.id} className="flex justify-between text-sm">
                      <span>{item.name} x {item.quantity}</span>
                      <span>₹{(item.price * item.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="border-t mt-4 pt-4">
                <div className="flex justify-between text-sm">
                    <span>Sub Total</span>
                    <span>₹{(cart.reduce((t, i) => t + i.price * i.quantity, 0)).toFixed(2)}</span>
                  </div>
                  <br></br>
                  <div className="flex justify-between text-sm">
                    <span>Handling Charges (4%)</span>
                    <span>₹{(calculateTotal() - cart.reduce((t, i) => t + i.price * i.quantity, 0)).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-semibold text-lg mt-4">
                    <span>Total</span>
                    <span>₹{calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>

              <div className="border rounded-lg p-4">
                <h3 className="font-medium text-gray-900 mb-4">Delivery Details</h3>
                <div className="space-y-2 text-sm">
                  <p><span className="font-medium">Name:</span> {name}</p>
                  <p><span className="font-medium">Phone:</span> {phone}</p>
                  <p><span className="font-medium">Seat Number:</span> {seatNumber}</p>
                  <p><span className="font-medium">Screen:</span> {screen}</p>
                </div>
              </div>

              <div>
                <p style={{ fontWeight: 'bold', color: 'red', textAlign: 'center' }}>
                  <span style={{ fontWeight: 'bold', color: 'darkcyan'}}> Wait until your </span>
                  order is confirmed  
                  <span style={{ fontWeight: 'bold', color: 'darkcyan'}}> after </span>
                  payment<div></div>
                   Don’t reload/close this page while processing
                </p>
                
              </div>
              <button
                onClick={handlePayment}
                disabled={isProcessing}
                className="w-full flex items-center justify-center space-x-2 bg-red-600 text-white py-3 px-4 rounded-md hover:bg-red-700 transition-colors duration-300 disabled:opacity-75"
              >
                <CreditCard className="w-5 h-5" />
                <span>{isProcessing ? 'Processing...' : 'Pay with PhonePe'}</span>
              </button>

              <p className="text-sm text-gray-500 text-center">
        By clicking "Pay with PhonePe", you agree to our{" "}
        <span
          onClick={toggleModal}
          className="text-purple-600 hover:underline cursor-pointer"
        >
          terms and conditions
        </span>.
      </p>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-lg w-96 max-h-[80vh] overflow-hidden">
            {/* Modal Header */}
            <div className="flex justify-between items-center border-b p-4">
              <h2 className="text-lg font-semibold">Terms and Conditions</h2>
              <button
                onClick={toggleModal}
                className="text-gray-600 hover:text-red-600"
              >
                ✖
              </button>
            </div>

{/* Modal Content with Scroll */}
<div className="p-4 overflow-y-auto max-h-[60vh]">
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


            {/* Modal Footer */}
            <div className="border-t p-4 flex justify-end">
              <button
                onClick={toggleModal}
                className="px-4 py-2 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
