import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { paymentService } from "@/services/payment.service";
import toast from "react-hot-toast";

export default function Billing() {
  const { user, refetchUser } = useAuth();
  const [loadingId, setLoadingId] = useState(null);

  const pricingData = [
    {
      id: "starter",
      name: "Starter Pack",
      pricing: 99,
      features: ['5 Repository Audits', 'Full Architecture Scan', 'Security Vulnerability Check', 'Performance Optimization Tips']
    },
    {
      id: "pro",
      name: "Pro Pack",
      pricing: 299,
      mostPopular: true,
      features: ['20 Repository Audits', 'Full Architecture Scan', 'Security Vulnerability Check', 'Performance Optimization Tips']
    },
    {
      id: "unlimited",
      name: "Power Pack",
      pricing: 999,
      features: ['100 Repository Audits', 'Full Architecture Scan', 'Security Vulnerability Check', 'Performance Optimization Tips']
    }
  ];

  const handlePurchase = async (packageId) => {
    setLoadingId(packageId);
    try {
      const res = await paymentService.createOrder({ packageId });
      const orderData = res.data.data;

      const options = {
        key: orderData.keyId,
        amount: orderData.amount,
        currency: orderData.currency,
        name: "AI Project Reviewer",
        description: `Purchase ${orderData.packageName}`,
        order_id: orderData.orderId,
        prefill: {
          name: orderData.userName || "",
          email: orderData.userEmail || "",
        },
        theme: {
          color: "#9333ea",
        },
        handler: async (response) => {
          try {
            toast.loading("Verifying payment...", { id: "razorpay-verify" });
            await paymentService.verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              packageId,
            });
            toast.success("Tokens purchased successfully!", { id: "razorpay-verify" });
            if (refetchUser) refetchUser();
          } catch (verifyErr) {
            console.error(verifyErr);
            toast.error("Payment verification failed", { id: "razorpay-verify" });
          } finally {
            setLoadingId(null);
          }
        },
        modal: {
          ondismiss: () => {
            setLoadingId(null);
          },
        },
      };

      const razorpayInstance = new window.Razorpay(options);
      razorpayInstance.on("payment.failed", function (response) {
        toast.error(`Payment Failed: ${response.error.description || "Transaction cancelled"}`);
        setLoadingId(null);
      });
      razorpayInstance.open();
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.message || "Failed to initiate payment");
      setLoadingId(null);
    }
  };


  return (
    <div className="w-full max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white">Tokens & Billing</h1>
        <p className="mt-2 text-slate-500 dark:text-slate-400">
          Purchase more tokens to continue auditing repositories. Current balance: <span className="font-bold text-purple-600 dark:text-purple-400">{user?.tokens} tokens</span>.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 items-end">
        {pricingData.map((plan) => (
          <div key={plan.id} className={`relative flex flex-col rounded-2xl p-6 transition-all duration-300
              ${plan.mostPopular 
                  ? 'bg-gradient-to-b from-purple-500/10 to-transparent border-2 border-purple-500 shadow-xl shadow-purple-500/10 scale-105 z-10' 
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:shadow-lg'}`}>
              
              {plan.mostPopular && (
                  <div className='absolute -top-3 left-1/2 -translate-x-1/2 bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider'>
                      Most Popular
                  </div>
              )}
              
              <h3 className="text-slate-900 dark:text-white font-bold text-lg mb-2">
                  {plan.name}
              </h3>
              <div className="flex items-baseline gap-1 mb-8">
                  <span className="text-4xl font-extrabold text-slate-900 dark:text-white">
                      ₹{plan.pricing}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400 text-sm font-medium">/ one-time</span>
              </div>
              
              <ul className="space-y-4 mb-8 flex-1">
                  {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-slate-700 dark:text-slate-300">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-emerald-500"><circle cx="12" cy="12" r="10" /><path d="m9 12 2 2 4-4" /></svg>
                          {feature}
                      </li>
                  ))}
              </ul>
              
              <button 
                  onClick={() => handlePurchase(plan.id)}
                  disabled={loadingId === plan.id}
                  className={`w-full cursor-pointer py-3 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2
                  ${plan.mostPopular 
                      ? 'bg-purple-600 hover:bg-purple-700 text-white shadow-md shadow-purple-500/25' 
                      : 'bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-900 dark:text-white'}
                  disabled:opacity-70 disabled:cursor-not-allowed`}
              >
                  {loadingId === plan.id ? 'Loading...' : 'Buy Now'}
              </button>
          </div>
        ))}
      </div>
    </div>
  );
}
