import { Injectable } from '@nestjs/common';

import { createTransport } from 'nodemailer';

import { env } from 'src/config/env';
import { EmailOptions } from 'src/core/interfaces/EmailOptions.interface';

@Injectable()
export class EmailService {
  private readonly transporter = createTransport({
    service: env.MAILER_SERVICE,
    auth: {
      user: env.MAILER_EMAIL,
      pass: env.MAILER_PASSWORD,
    },
  });

  async sendEmail(options: EmailOptions) {
    await this.transporter.sendMail({
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
  }
}
