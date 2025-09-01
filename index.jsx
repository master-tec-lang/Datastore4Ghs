import React, { useState, useMemo } from 'react';

const MTN_BASE = {1:5.3,2:10.5,3:15.4,4:20.3,5:25.2};
function generateMtnPrices(){ const prices={}; prices[1]=MTN_BASE[1]; prices[2]=MTN_BASE[2]; for(let g=3;g<=30;g++){prices[g]=+(MTN_BASE[2]+(g-2)*4.9).toFixed(2);} return prices;}
const MTN_PRICES = generateMtnPrices();
const TIGO_ISHARE_PRICES = Object.fromEntries(Object.entries(MTN_PRICES).map(([g,p])=>[g,Math.trunc(p)]));
const TIGO_BIGTIME={15:57,20:71,25:76,30:80,40:90,50:100,100:210};
const TELECEL={5:24.5,10:45,15:60,20:80,25:100,30:111};

export default function Home(){
  const [provider,setProvider]=useState('MTN');
  const [selectedGb,setSelectedGb]=useState('1');
  const [recipient,setRecipient]=useState('');
  const [email,setEmail]=useState('');
  const [purpose,setPurpose]=useState('data');
  const [afaName,setAfaName]=useState('');
  const [afaPhone,setAfaPhone]=useState('');
  const [afaLocation,setAfaLocation]=useState('');
  const [afaDob,setAfaDob]=useState('');

  const bundles=useMemo(()=>{
    if(provider==='MTN') return MTN_PRICES;
    if(provider==='TIGO_ISHARE') return TIGO_ISHARE_PRICES;
    if(provider==='TIGO_BIGTIME') return TIGO_BIGTIME;
    if(provider==='TELECEL') return TELECEL;
    return {};
  },[provider]);

  const amount=useMemo(()=>{
    const gb=Number(selectedGb);
    if(purpose==='afa') return 8.0;
    return bundles[gb]??0;
  },[bundles,selectedGb,purpose]);

  async function handleBuy(e){
    e.preventDefault();
    if(!email){alert('Email is required'); return;}
    const metadata = {provider, selectedGb, recipient, purpose, afa: purpose==='afa'?{name:afaName,phone:afaPhone,location:afaLocation,dob:afaDob}:null};
    try{
      const res = await fetch('/api/initialize',{
        method:'POST',
        headers:{'Content-Type':'application/json'},
        body: JSON.stringify({email, amount: Math.round(amount*100), metadata})
      });
      const data = await res.json();
      if(data.status && data.data && data.data.authorization_url){
        window.location.href = data.data.authorization_url;
      } else alert('Payment initialization failed: ' + JSON.stringify(data));
    }catch(err){console.error(err); alert('Error initializing payment');}
  }

  return (
    <div style={{fontFamily:'system-ui,sans-serif',padding:24,maxWidth:900,margin:'0 auto'}}>
      <h1>Data Bundles & AFA Registration</h1>
      <p>Support: 0247918766 | Manager: 0556429525</p>

      <div style={{display:'flex',gap:16,marginTop:18}}>
        <div style={{flex:1}}>
          <label>Provider</label>
          <select value={provider} onChange={(e)=>{setProvider(e.target.value); setSelectedGb(Object.keys(({MTN:MTN_PRICES,TIGO_ISHARE:TIGO_ISHARE_PRICES,TIGO_BIGTIME:TIGO_BIGTIME,TELECEL:TELECEL})[e.target.value])[0]);}} style={{width:'100%',padding:8}}>
            <option value="MTN">MTN</option>
            <option value="TIGO_ISHARE">TIGO ISHARE</option>
            <option value="TIGO_BIGTIME">TIGO BIG-TIME</option>
            <option value="TELECEL">TELECEL</option>
          </select>

          <div style={{marginTop:12}}>
            <label>Bundles (select GB)</label>
            <select value={selectedGb} onChange={e=>setSelectedGb(e.target.value)} style={{width:'100%',padding:8}}>
              {Object.keys(bundles).map(g=><option key={g} value={g}>{g} GB — GHS {bundles[g]}</option>)}
            </select>
          </div>

          <div style={{marginTop:12}}>
            <label>Recipient Phone</label>
            <input value={recipient} onChange={e=>setRecipient(e.target.value)} placeholder="024XXXXXXXX" style={{width:'100%',padding:8}}/>
          </div>

          <div style={{marginTop:12}}>
            <label>Purpose</label>
            <select value={purpose} onChange={e=>setPurpose(e.target.value)} style={{width:'100%',padding:8}}>
              <option value="data">Purchase Data</option>
              <option value="wallet">Deposit to Wallet</option>
              <option value="afa">AFA Membership (GHS 8)</option>
            </select>
          </div>

          {purpose==='afa'&&<div style={{marginTop:12,border:'1px solid #ddd',padding:12}}>
            <h3>AFA Registration</h3>
            <input value={afaName} onChange={e=>setAfaName(e.target.value)} placeholder="Full name" style={{width:'100%',padding:8,marginTop:6}}/>
            <input value={afaPhone} onChange={e=>setAfaPhone(e.target.value)} placeholder="Phone" style={{width:'100%',padding:8,marginTop:6}}/>
            <input value={afaLocation} onChange={e=>setAfaLocation(e.target.value)} placeholder="Location" style={{width:'100%',padding:8,marginTop:6}}/>
            <input value={afaDob} onChange={e=>setAfaDob(e.target.value)} placeholder="DOB YYYY-MM-DD" style={{width:'100%',padding:8,marginTop:6}}/>
          </div>}

          <div style={{marginTop:12}}>
            <label>Email (for Paystack)</label>
            <input value={email} onChange={e=>setEmail(e.target.value)} placeholder="customer@example.com" style={{width:'100%',padding:8}}/>
          </div>

          <div style={{marginTop:12}}><strong>Total: GHS {amount}</strong></div>
          <button onClick={handleBuy} style={{marginTop:12,padding:'10px 16px',borderRadius:6}}>Pay with Paystack</button>
        </div>
      </div>
    </div>
  )
}
