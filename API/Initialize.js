const fetch = require('node-fetch');
export default async function handler(req,res){
  if(req.method!=='POST') return res.status(405).json({message:'Method not allowed'});
  const secret=process.env.PAYSTACK_SECRET_KEY;
  const baseUrl=process.env.BASE_URL;
  if(!secret) return res.status(500).json({message:'Paystack secret key not configured'});
  const {email,amount,metadata}=req.body;
  if(!email||!amount) return res.status(400).json({message:'email and amount required'});
  const body={email,amount,metadata:JSON.stringify(metadata||{}),callback_url:baseUrl?`${baseUrl}/payment-callback`:undefined};
  try{
    const resp=await fetch('https://api.paystack.co/transaction/initialize',{
      method:'POST',
      headers:{Authorization:`Bearer ${secret}`,'Content-Type':'application/json'},
      body:JSON.stringify(body)
    });
    const data=await resp.json();
    res.status(200).json(data);
  }catch(err){console.error(err); res.status(500).json({message:'Error calling Paystack',error:String(err)});}
}
