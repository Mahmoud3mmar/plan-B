// import { Injectable, InternalServerErrorException } from '@nestjs/common';
// import axios from 'axios';

// @Injectable()
// export class PaymentService {
//   private readonly fawriApiUrl = 'https://api.fawri.com'; // Replace with actual Fawri API URL
//   private readonly apiKey = process.env.FAWRI_API_KEY; // Store your API key securely

//   async initiatePayment(courseId: string, amount: number, userId: string): Promise<any> {
//     try {
//       const response = await axios.post(`${this.fawriApiUrl}/payments`, {
//         courseId,
//         amount,
//         userId,
//         // Additional payment details as required by Fawri
//       }, {
//         headers: {
//           'Authorization': `Bearer ${this.apiKey}`,
//           'Content-Type': 'application/json',
//         },
//       });

//       return response.data;
//     } catch (error) {
//       console.error('Error initiating payment:', error);
//       throw new InternalServerErrorException('Failed to initiate payment');
//     }
//   }

//   async verifyPayment(transactionId: string): Promise<boolean> {
//     try {
//       const response = await axios.get(`${this.fawriApiUrl}/payments/${transactionId}`, {
//         headers: {
//           'Authorization': `Bearer ${this.apiKey}`,
//         },
//       });

//       // Check the response to determine if the payment was successful
//       return response.data.status === 'success';
//     } catch (error) {
//       console.error('Error verifying payment:', error);
//       throw new InternalServerErrorException('Failed to verify payment');
//     }
//   }
// } 