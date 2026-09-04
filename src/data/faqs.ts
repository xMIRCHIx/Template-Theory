import { FAQItem } from '../types';

export const FAQS_DATA: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'How do I download my digital files after purchase?',
    answer: 'Immediately upon completing checkout, you will be redirected to your secure order confirmation page with instant 1-click download buttons. We also automatically send a copy of your download links and license key to your email address for lifetime access.',
    category: 'orders'
  },
  {
    id: 'faq-2',
    question: 'Which software programs are supported?',
    answer: 'Our Lightroom Presets work on Lightroom Classic, Lightroom CC, Mobile DNG, and Photoshop Camera Raw. Our LUTs are 3D .CUBE files compatible with Premiere Pro, DaVinci Resolve, Final Cut Pro, and CapCut. PSDs require Photoshop CC or Photopea, and Fonts work across all modern operating systems and design software.',
    category: 'products'
  },
  {
    id: 'faq-3',
    question: 'Is commercial usage allowed with my purchase?',
    answer: 'Yes! Every purchase includes our standard Commercial License. You are allowed to use our presets, LUTs, templates, fonts, and assets in client work, commercial video productions, branded social media posts, advertising, and digital products without attribution.',
    category: 'license'
  },
  {
    id: 'faq-4',
    question: 'Are future updates to the products included?',
    answer: 'Absolutely. Whenever we release new presets, LUT updates for new camera sensors, or extra PSD layouts, you will receive an email update with free access to the new version forever.',
    category: 'products'
  },
  {
    id: 'faq-5',
    question: 'What if I lose my files or switch to a new computer?',
    answer: 'No problem at all! You can retrieve your downloads anytime by entering your purchase email on our download recovery portal or contacting our support team at support@templatetheory.co.',
    category: 'technical'
  },
  {
    id: 'faq-6',
    question: 'Do you offer refunds on digital goods?',
    answer: 'Since digital downloads cannot be returned once delivered, sales are generally final. However, if you experience any technical issues with corrupted files or incompatibility that our team cannot resolve, we will gladly issue a full refund within 14 days.',
    category: 'orders'
  }
];
