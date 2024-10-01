import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    try {
      const { transactionDetails } = req.body;

      // Call Smaregi API to register transaction
      const response = await axios.post(
        'https://api.smaregi.jp/access/v1/transactions',
        transactionDetails,
        {
          headers: {
            'Content-Type': 'application/json',
            'X-contract-id': process.env.SMAREGI_CONTRACT_ID,
            'X-access-token': process.env.SMAREGI_API_KEY,
          },
        }
      );

      res.status(200).json({ message: 'Transaction registered successfully', data: response.data });
    } catch (err: any) {
      res.status(500).json({ statusCode: 500, message: err.message });
    }
  } else {
    res.setHeader('Allow', 'POST');
    res.status(405).end('Method Not Allowed');
  }
}
