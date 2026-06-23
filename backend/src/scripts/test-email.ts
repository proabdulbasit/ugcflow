import 'dotenv/config';
import { sendEmail, emailFrom } from '../services/email.js';

async function main() {
  const to = process.argv[2] || 'proabdulbasit@gmail.com';
  console.log('RESEND_FROM:', emailFrom());
  console.log('Sending test to:', to);
  const result = await sendEmail({
    to,
    subject: 'UGCFlow localhost test',
    html: '<p>If you see this, Resend is working on localhost.</p>',
  });
  console.log('Result:', result);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
