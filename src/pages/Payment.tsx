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
                  <span style={{ fontWeight: 'bold', color: 'black'}}> Wait until your </span>
                  order is confirmed  
                  <span style={{ fontWeight: 'bold', color: 'black'}}> after </span>
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
          onClick={() => navigate('/TermsAndConditions')}
          className="text-purple-600 hover:underline cursor-pointer"
        >
          terms and conditions   
        </span>
  <br></br>
        <span
          onClick={() => navigate('/PrivacyPolicy')}
          className="text-purple-600 hover:underline cursor-pointer"
        >
          Privacy Policy
        </span>

      </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Payment;
