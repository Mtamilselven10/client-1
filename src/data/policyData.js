import { SHOP_NAME, CUSTOMER_CARE_EMAIL } from '../config';

export const POLICY_SECTIONS = [
  {
    title: "1. Pure Food Commitment & Freshness Guarantee",
    content: `At ${SHOP_NAME}, our foundation is unwavering honesty in food provisions. If any sealed provision delivered to you does not meet our high benchmarks for fragrance, freshness, or authenticity, we will replace it or issue a prompt full refund within 48 hours of delivery.`
  },
  {
    title: "2. Privacy & Personal Information Handling",
    content: `We honor your personal privacy as strictly as our store traditions. When you communicate or place orders via WhatsApp or our care channels, your name, telephone number, and delivery address are utilized strictly for order fulfilment, tracking, and customer service. We do not sell, rent, or trade your data to third-party telemarketers or external advertising networks.`
  },
  {
    title: "3. Direct WhatsApp Order Terms",
    content: `When placing orders via our instant WhatsApp messaging channel, price quotations reflect the rates listed in our live catalog at the time of inquiry. Order confirmation occurs once our dedicated care executive verifies stock availability and provides your dispatch receipt.`
  },
  {
    title: "4. Return, Replacement & Cancellation Policy",
    content: `Cancellations can be requested prior to parcel dispatch at no cost. For food safety reasons, opened consumables cannot be returned unless damaged in transit or defective. In the rare event of transit breakage or packaging compromise, simply send a photo to ${CUSTOMER_CARE_EMAIL} or our WhatsApp support.`
  },
  {
    title: "5. Pricing, Weights & Natural Variations",
    content: `Because agricultural produce is subject to seasonal harvests and soil conditions, subtle natural variations in color, aroma, and seed grain size may occur. All weights are verified on certified digital electronic balances prior to sealing.`
  }
];
