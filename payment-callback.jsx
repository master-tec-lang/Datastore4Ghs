import { useEffect,useState } from 'react';
import { useRouter } from 'next/router';
export default function PaymentCallback(){
  const router=useRouter();
  const [status,setStatus]=useState('Verifying payment...');
  useEffect(()=>{
    const {reference}=router.query;
    if(!reference)return;
    async function verify(){
      try{
        const res=await fetch(`/api/verify-payment?reference=${reference}`);
        const data=await res.json();
        setStatus(data.status?'Payment successful! Thank you.':'Payment verification failed.');
      }catch(err){console.error(err); setStatus('Error verifying payment.');}
    } verify();
  },[router.query]);
  return(<div style={{fontFamily:'system-ui, sans-serif',padding:24}}>
    <h1>Payment Status</h1>
    <p>{status}</p>
  </div>);
}
