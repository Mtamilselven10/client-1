import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

const categories = [
  'Grains, Rice & Millets',
  'Organic Pulses & Lentils',
  'Cold-Pressed Oils & Pure Ghee',
  'Spices, Masalas & Seasonings',
  'Dry Fruits, Nuts & Seeds',
  'Farm Honey & Country Sugars',
  'Artisanal Teas & Filter Coffee',
  'Heritage Crisps & Snacks'
];

const rawProducts = [
  // Grains, Rice & Millets
  {
    name: "Royal Aged Basmati Rice (XXL Long Grain)",
    category: "Grains, Rice & Millets",
    price: 185,
    mrp: 230,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 342,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "2-year aged Himalayan foothill Basmati with delicate fragrant aroma and elongated fluffy grains that double in length when cooked.",
    details: "Origin: Dehradun Valley. Aged: 24 Months. Non-GMO, pesticide-free harvest. Ideal for royal biryanis and festive pulao.",
    in_stock: true
  },
  {
    name: "Organic Traditional Sona Masoori Raw Rice",
    category: "Grains, Rice & Millets",
    price: 92,
    mrp: 110,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 289,
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    description: "Lightweight, aromatic medium-grain rice grown organically along the Tungabhadra river basin, effortlessly easy to digest.",
    details: "Origin: Tungabhadra Basin. Naturally unpolished, rich in essential dietary fiber and gentle on digestion.",
    in_stock: true
  },
  {
    name: "Traditional Single-Boiled Ponni Rice",
    category: "Grains, Rice & Millets",
    price: 88,
    mrp: 105,
    unit: "1 kg",
    rating: 4.7,
    reviews_count: 174,
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80",
    description: "Steamed once in copper vats to lock in nutrition. Firm, non-sticky texture preferred for authentic South Indian lunches.",
    details: "Origin: Kaveri Delta, Thanjavur. Parboiled single steam method. Excellent glycemic balance.",
    in_stock: true
  },
  {
    name: "Ancient Brown Foxtail Millet (Thinai)",
    category: "Grains, Rice & Millets",
    price: 120,
    mrp: 145,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 198,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    description: "Supergrain rich in iron, zinc, and slow-release complex carbs. Naturally gluten-free and diabetic friendly.",
    details: "Origin: Dharmapuri rain-fed farms. 100% whole grain unpolished millet. High dietary fiber (12g/100g).",
    in_stock: true
  },
  {
    name: "Stone-Ground Whole Wheat Sharbati Atta",
    category: "Grains, Rice & Millets",
    price: 260,
    mrp: 310,
    unit: "5 kg",
    rating: 4.9,
    reviews_count: 512,
    image: "https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=80",
    description: "Ground on slow-spinning natural stone chakki to retain germ and bran. Makes exceptionally soft, golden, puffed rotis.",
    details: "Origin: Sehore, Madhya Pradesh. 100% MP Sharbati whole grain. Cold-milled under 40°C to preserve natural vitamins.",
    in_stock: true
  },
  {
    name: "Organic Red Rice (Kattuyanam)",
    category: "Grains, Rice & Millets",
    price: 140,
    mrp: 170,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 89,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Rare indigenous heritage red rice revered in Siddha medicine for building stamina and vitality.",
    details: "Origin: Pudukkottai wild agro-forests. Anthocyanin-rich bran layer with dense antioxidant profile.",
    in_stock: true
  },
  {
    name: "Whole Finger Millet Flour (Ragi Atta)",
    category: "Grains, Rice & Millets",
    price: 75,
    mrp: 90,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 165,
    image: "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80",
    description: "Naturally sprouted and stone-ground ragi loaded with ten times the calcium of standard white rice or milk.",
    details: "Calcium powerhouse: 344mg/100g. Recommended for growing children, elders, and nutrient-dense rotis/porridge.",
    in_stock: true
  },
  {
    name: "Pearl Millet (Kambu / Bajra Grains)",
    category: "Grains, Rice & Millets",
    price: 65,
    mrp: 80,
    unit: "1 kg",
    rating: 4.7,
    reviews_count: 92,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    description: "Hearty drought-resistant grain revered for summer cooling porridges and hearty winter flatbreads.",
    details: "Sourced directly from native farmers in Theni. Rich in magnesium, potassium, and amino acids.",
    in_stock: true
  },
  {
    name: "Little Millet (Samai Raw)",
    category: "Grains, Rice & Millets",
    price: 110,
    mrp: 130,
    unit: "500 g",
    rating: 4.8,
    reviews_count: 76,
    image: "https://images.unsplash.com/photo-1536304993881-ff6e9eefa2a6?auto=format&fit=crop&w=600&q=80",
    description: "Delicate small golden grains with mild nutty taste, cooks fast like rice for wholesome daily meals.",
    details: "Zero chemical polish. High in B-vitamins and iron. Perfect substitute for table rice.",
    in_stock: true
  },
  {
    name: "Kodo Millet (Varagu)",
    category: "Grains, Rice & Millets",
    price: 115,
    mrp: 140,
    unit: "500 g",
    rating: 4.8,
    reviews_count: 110,
    image: "https://images.unsplash.com/photo-1516684732162-798a0062be99?auto=format&fit=crop&w=600&q=80",
    description: "Ancient grain high in polyphenols and antioxidants, traditionally prescribed for gut health and stamina.",
    details: "Origin: Salem hill tracts. Hand-dehulled to preserve outer nutritious aleurone layer.",
    in_stock: true
  },
  {
    name: "Organic Rolled Jumbo Oats",
    category: "Grains, Rice & Millets",
    price: 160,
    mrp: 195,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 220,
    image: "https://images.unsplash.com/photo-1517093708149-a93165b6823d?auto=format&fit=crop&w=600&q=80",
    description: "Thick-cut, whole grain rolled oats delivering rich texture and heart-healthy soluble beta-glucan.",
    details: "100% wholegrain. Zero preservatives, zero additives. Great for warm oatmeal, overnight bowls, or baking.",
    in_stock: true
  },
  {
    name: "Barnyard Millet (Kuthiraivali)",
    category: "Grains, Rice & Millets",
    price: 125,
    mrp: 150,
    unit: "500 g",
    rating: 4.7,
    reviews_count: 84,
    image: "https://images.unsplash.com/photo-1574323347407-f5e1ad6d020b?auto=format&fit=crop&w=600&q=80",
    description: "High in digestible protein and lowest in carbohydrate content among all cereal grains.",
    details: "Naturally gluten-free. Fast-cooking grain ideal for nutritious khichdi, idli batter, and upma.",
    in_stock: true
  },

  // Organic Pulses & Lentils
  {
    name: "Unpolished Organic Toor Dal (Pigeon Peas)",
    category: "Organic Pulses & Lentils",
    price: 165,
    mrp: 195,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 420,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Sun-dried farm toor dal without synthetic water or oil polish, yielding thick aromatic sambar with natural sweetness.",
    details: "Origin: Latur, Maharashtra. 100% unpolished. Cooks easily with rich creamy froth and hearty aroma.",
    in_stock: true
  },
  {
    name: "Farm Fresh Green Moong Whole",
    category: "Organic Pulses & Lentils",
    price: 135,
    mrp: 160,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 195,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Plump green whole gram with 98%+ germination rate for super-sprouts, dal fry, and traditional cheela.",
    details: "High plant protein (24g/100g). Sun-cured on open farm yards without chemical fumigation.",
    in_stock: true
  },
  {
    name: "Yellow Split Moong Dal (Dhuli)",
    category: "Organic Pulses & Lentils",
    price: 145,
    mrp: 175,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 260,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Ultra-clean, light split moong dal that boils down into comforting soothing kitchari and festive sweet halwa.",
    details: "Easy to digest, recommended for detox diets and post-recovery nourishing broths.",
    in_stock: true
  },
  {
    name: "Whole Black Urad Dal with Husk",
    category: "Organic Pulses & Lentils",
    price: 175,
    mrp: 210,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 310,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    description: "Heritage jet-black whole lentils essential for velvety Punjabi Dal Makhani and traditional bone-strengthening porridge.",
    details: "Origin: Guntur soil. Dense in iron, calcium, and plant mucilage for digestive health.",
    in_stock: true
  },
  {
    name: "Gota White Urad Dal (Idli Special)",
    category: "Organic Pulses & Lentils",
    price: 180,
    mrp: 215,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 480,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Whole round de-husked urad dal with outstanding fermenting capacity that yields cloud-soft, spongy idlis and crisp vadas.",
    details: "Superior batter volume expansion of 2.4x. Completely free from talc or synthetic brightening agents.",
    in_stock: true
  },
  {
    name: "Kashmiri Red Kidney Beans (Rajma Chitra)",
    category: "Organic Pulses & Lentils",
    price: 195,
    mrp: 235,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 275,
    image: "https://images.unsplash.com/photo-1551462147-ff29053fad38?auto=format&fit=crop&w=600&q=80",
    description: "Speckled high-altitude kidney beans that melt tender when cooked, infusing gravies with deep buttery richness.",
    details: "Origin: Bhaderwah, Jammu & Kashmir. High natural mineral content and soft, silky skin.",
    in_stock: true
  },
  {
    name: "Jumbo Kabuli Chickpeas (Garbanzo Beans)",
    category: "Organic Pulses & Lentils",
    price: 170,
    mrp: 205,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 230,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Even-sized 12mm jumbo chickpeas perfect for Amritsari Pindi Chole, fresh creamy hummus, and Mediterranean salads.",
    details: "Grade A handpicked. Firm outer bite with tender buttery core upon pressure cooking.",
    in_stock: true
  },
  {
    name: "Desi Brown Chana (Kala Chana)",
    category: "Organic Pulses & Lentils",
    price: 95,
    mrp: 120,
    unit: "1 kg",
    rating: 4.7,
    reviews_count: 180,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Nutty indigenous small brown chickpeas, powerhouse of dietary iron and sustained muscle fuel.",
    details: "Traditional rainfed variety. Excellent for sundal, morning sprout salads, and spicy curries.",
    in_stock: true
  },
  {
    name: "Red Masoor Dal (Split Red Lentils)",
    category: "Organic Pulses & Lentils",
    price: 110,
    mrp: 135,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 145,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Quick-cooking vibrant salmon-pink lentils that melt in 15 minutes into a rich, golden, velvety stew.",
    details: "Cooks fast with no prior soaking required. High in folate, potassium, and plant protein.",
    in_stock: true
  },
  {
    name: "Horse Gram (Kollu / Kulthi)",
    category: "Organic Pulses & Lentils",
    price: 85,
    mrp: 105,
    unit: "500 g",
    rating: 4.8,
    reviews_count: 125,
    image: "https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=600&q=80",
    description: "Ancient thermogenic super-pulse renowned in Ayurveda for metabolic vitality, weight balance, and kidney health.",
    details: "Rich in calcium and polyphenols. Popular for traditional rasam, soups, and dry roasted podis.",
    in_stock: true
  },
  {
    name: "Roasted Gram / Chutney Dal (Pottukadalai)",
    category: "Organic Pulses & Lentils",
    price: 130,
    mrp: 155,
    unit: "1 kg",
    rating: 4.9,
    reviews_count: 310,
    image: "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80",
    description: "Crispy wood-roasted split chickpeas that add body to coconut chutneys, snack mixtures, and festive laddoos.",
    details: "Ready to eat snack or culinary staple. Crispy golden crunch with zero added oil.",
    in_stock: true
  },

  // Cold-Pressed Oils & Pure Ghee
  {
    name: "Pure Vedic A2 Desi Gir Cow Cultured Bilona Ghee",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 1450,
    mrp: 1750,
    unit: "500 ml",
    rating: 5.0,
    reviews_count: 615,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
    description: "Crafted through the ancient 5-step Bilona method from curd of grass-fed native Gir cows. Granular danedar golden texture with divine aroma.",
    details: "Cultured curd churned with wooden bilona, slow-simmered on low flame. Packed in UV-protective amber glass jar.",
    in_stock: true
  },
  {
    name: "Wood-Pressed Virgin Groundnut Oil (Marachekku)",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 340,
    mrp: 395,
    unit: "1 Litre",
    rating: 4.9,
    reviews_count: 450,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Extracted in slow wooden expellers (Vagai wood) from sun-dried native groundnuts with zero heat and zero chemicals.",
    details: "Unrefined, unbleached, sedimentation filtered. High smoke point with sweet nutty aroma for wholesome daily frying.",
    in_stock: true
  },
  {
    name: "Wood-Pressed Gingelly / Sesame Oil with Palm Jaggery",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 420,
    mrp: 490,
    unit: "1 Litre",
    rating: 4.9,
    reviews_count: 380,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Traditional cold extraction of black sesame seeds blended with authentic palm jaggery to pacify sharpness and maximize antioxidants.",
    details: "Sourced from Erode oil mills. Ideal for traditional South Indian culinary temperings and oil-pulling.",
    in_stock: true
  },
  {
    name: "Extra Virgin Cold-Pressed Coconut Oil (Raw)",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 360,
    mrp: 425,
    unit: "1 Litre",
    rating: 4.9,
    reviews_count: 395,
    image: "https://images.unsplash.com/photo-1526947425960-945c6e72858f?auto=format&fit=crop&w=600&q=80",
    description: "Made from fresh mature coastal coconuts within hours of harvesting. Crystal clear with delicate tropical aroma.",
    details: "Rich in Medium Chain Triglycerides (MCTs) & Lauric Acid. 100% raw edible, hair, and skincare grade.",
    in_stock: true
  },
  {
    name: "Kachi Ghani Raw Mustard Oil (Sarson)",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 240,
    mrp: 285,
    unit: "1 Litre",
    rating: 4.8,
    reviews_count: 210,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Pungent, authentic cold-pressed mustard oil with natural allylisothiocyanate bite that elevates Bengali and North Indian cooking.",
    details: "Cold-pressed from small black mustard seeds in Rajasthan. Preserves natural antioxidants and Omega-3 fatty acids.",
    in_stock: true
  },
  {
    name: "Cold-Pressed Niger Seed Oil (Uchellu)",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 390,
    mrp: 460,
    unit: "1 Litre",
    rating: 4.7,
    reviews_count: 65,
    image: "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80",
    description: "Tribal cold-pressed edible oil celebrated for intense nutty flavor, linoleic acid, and cardiac health support.",
    details: "Extracted from wild rainfed niger seeds harvested in Eastern Ghats.",
    in_stock: true
  },
  {
    name: "Pure Buffalo Milk Desi Ghee (Rich Aromatic)",
    category: "Cold-Pressed Oils & Pure Ghee",
    price: 650,
    mrp: 750,
    unit: "1 Litre",
    rating: 4.8,
    reviews_count: 190,
    image: "https://images.unsplash.com/photo-1628088062854-d1870b4553da?auto=format&fit=crop&w=600&q=80",
    description: "Silky, ivory-white, high-fat ghee from pasture-grazed Murrah buffaloes. Gives unmatched crispness to parathas and sweets.",
    details: "Origin: Haryana plains. Clarified butter with luscious creamy taste and higher smoke point.",
    in_stock: true
  },

  // Spices, Masalas & Seasonings
  {
    name: "Alleppey Extra Bold Green Cardamom (8mm+)",
    category: "Spices, Masalas & Seasonings",
    price: 490,
    mrp: 580,
    unit: "100 g",
    rating: 5.0,
    reviews_count: 320,
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    description: "The Queen of Spices: massive emerald green pods packed with essential-oil-dense seeds bursting with eucalyptus citrus sweetness.",
    details: "Grade: 8mm Jumbo Bold. Harvested in the Cardamom Hills of Idukki, Kerala. Sun-dried in traditional kiln dryers.",
    in_stock: true
  },
  {
    name: "Salem Pure Golden Curcumin Turmeric Powder",
    category: "Spices, Masalas & Seasonings",
    price: 110,
    mrp: 140,
    unit: "250 g",
    rating: 4.9,
    reviews_count: 410,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80",
    description: "Stone-pulverized from whole Salem finger turmeric with certified 4.5%+ active curcumin. Pure golden warmth without starch fillers.",
    details: "Zero lead chromate, zero artificial dyes. Tested pure for daily golden milk (haldi doodh) and healing cuisine.",
    in_stock: true
  },
  {
    name: "Tellicherry Whole Black Peppercorns (TGSEB)",
    category: "Spices, Masalas & Seasonings",
    price: 210,
    mrp: 260,
    unit: "200 g",
    rating: 4.9,
    reviews_count: 280,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Tellicherry Garbled Special Extra Bold: vine-ripened berries dried naturally to yield deep complex citrus and woodsy heat.",
    details: "Hand-graded for size (>4.75mm). Origin: Thalassery coast, Malabar. The world gold-standard of pepper.",
    in_stock: true
  },
  {
    name: "Authentic Kashmiri Mongra Saffron (Grade A1)",
    category: "Spices, Masalas & Seasonings",
    price: 480,
    mrp: 590,
    unit: "1 g",
    rating: 5.0,
    reviews_count: 195,
    image: "https://images.unsplash.com/photo-1608686207856-001b95cf60ca?auto=format&fit=crop&w=600&q=80",
    description: "100% pure thick red stigmas harvested from purple saffron crocus fields of Pampore, Kashmir. Divine royal aroma and color.",
    details: "GI Tagged origin Pampore. Highest crocin and safranal content. Preserved in airtight protective glass vial.",
    in_stock: true
  },
  {
    name: "Ceylon True Cinnamon Quills (Alba Grade)",
    category: "Spices, Masalas & Seasonings",
    price: 280,
    mrp: 340,
    unit: "100 g",
    rating: 4.9,
    reviews_count: 160,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Paper-thin, multi-layered sweet cinnamon scrolls with negligible coumarin content, safe for regular dietary wellness.",
    details: "Authentic Cinnamomum verum (Ceylon). Subtle fragrant sweet woody flavor, distinct from cheap cassia bark.",
    in_stock: true
  },
  {
    name: "Guntur Stemless Dry Red Chilli (Teja Variety)",
    category: "Spices, Masalas & Seasonings",
    price: 130,
    mrp: 160,
    unit: "250 g",
    rating: 4.8,
    reviews_count: 220,
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
    description: "Fiery, sun-dried red chillies with clean de-stemmed pods, delivering deep scarlet natural color and electrifying heat.",
    details: "Scoville Heat Units: 65,000+. De-stemmed by hand to guarantee pure spice weight without trash stem waste.",
    in_stock: true
  },
  {
    name: "Organic Whole Cumin Seeds (Jeera)",
    category: "Spices, Masalas & Seasonings",
    price: 140,
    mrp: 175,
    unit: "250 g",
    rating: 4.9,
    reviews_count: 310,
    image: "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80",
    description: "Intensely fragrant small seed cumin with high volatile thymol oil, crackles with earthy warmth in hot ghee.",
    details: "Origin: Unjha, Gujarat. Machine cleaned and de-stoned, 99.8% pure seed count.",
    in_stock: true
  },
  {
    name: "Small Black Mustard Seeds (Rai / Kadugu)",
    category: "Spices, Masalas & Seasonings",
    price: 45,
    mrp: 60,
    unit: "200 g",
    rating: 4.8,
    reviews_count: 185,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Tiny micro-mustard seeds that pop and sing vigorously in hot tadka, imparting irresistible nutty aroma to curries.",
    details: "Triple sorted and cleaned. Essential daily spice for Indian temperings.",
    in_stock: true
  },
  {
    name: "Pure Compound Asafoetida Lump (Perungayam / Hing)",
    category: "Spices, Masalas & Seasonings",
    price: 165,
    mrp: 200,
    unit: "50 g",
    rating: 4.9,
    reviews_count: 240,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80",
    description: "Traditional resin asafoetida with deep umami aroma. A pinhead pinch elevates sambar and digestive rasam instantly.",
    details: "Ferula plant resin. No added wheat fillers or artificial gum binders.",
    in_stock: true
  },
  {
    name: "Madurai Stone Ground Coriander Powder (Dhania)",
    category: "Spices, Masalas & Seasonings",
    price: 90,
    mrp: 115,
    unit: "250 g",
    rating: 4.8,
    reviews_count: 190,
    image: "https://images.unsplash.com/photo-1615485500704-8e990f9900f7?auto=format&fit=crop&w=600&q=80",
    description: "Slow-roasted green coriander seeds ground coarsely to impart refreshing herbal citrus flavor and gravy body.",
    details: "Contains high natural seed essential oils. Zero stale odor.",
    in_stock: true
  },
  {
    name: "Kashmiri Mild Degi Mirch Powder",
    category: "Spices, Masalas & Seasonings",
    price: 160,
    mrp: 195,
    unit: "200 g",
    rating: 4.9,
    reviews_count: 275,
    image: "https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=600&q=80",
    description: "Luminous naturally crimson chilli powder that imparts breathtaking restaurant-style red color with mild, gentle heat.",
    details: "100% pure sun-cured Kashmiri red chillies without Sudan dyes or artificial color enhancers.",
    in_stock: true
  },
  {
    name: "Himalayan Pink Rock Salt (Sendha Namak Fine)",
    category: "Spices, Masalas & Seasonings",
    price: 70,
    mrp: 90,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 360,
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80",
    description: "Unrefined ancient sea salt crystals mined from pristine mountain seams, containing 84 natural trace minerals.",
    details: "Pure Sendha Namak suitable for fasting (vrat), balancing electrolytes, and finishing seasoning.",
    in_stock: true
  },

  // Dry Fruits, Nuts & Seeds
  {
    name: "Premium California Whole Almonds (Badam Giri)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 490,
    mrp: 620,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 410,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
    description: "Crunchy, sweet nonpareil kernels rich in Vitamin E, dietary fiber, and plant-based protein.",
    details: "100% whole kernels with uniform shape and zero bitter almond contamination.",
    in_stock: true
  },
  {
    name: "Goan King Whole Cashews (W240 Grade)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 520,
    mrp: 650,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 380,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Large, buttery white cashew nuts hand-shelled in coastal Konkan plantations. Sweet, crisp, and rich in healthy fats.",
    details: "Grade: White Whole 240 (King Size). Vacuum sealed for maximum crispness and zero moisture absorption.",
    in_stock: true
  },
  {
    name: "Kashmiri Snow-White Walnut Kernels (Akhrot)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 580,
    mrp: 720,
    unit: "400 g",
    rating: 4.9,
    reviews_count: 245,
    image: "https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=600&q=80",
    description: "Light amber halved walnut kernels bursting with natural brain-boosting Omega-3 ALA fatty acids and zero bitterness.",
    details: "Origin: Kupwara orchards, Kashmir. Hand-cracked from soft-shell kagzi walnuts.",
    in_stock: true
  },
  {
    name: "Royal Medjool Jumbo Dates (Soft & Caramelly)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 640,
    mrp: 780,
    unit: "500 g",
    rating: 5.0,
    reviews_count: 290,
    image: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=600&q=80",
    description: "The King of Dates: plump, luscious, naturally caramel-sweet fruit with velvety pulp that melts in your mouth.",
    details: "100% natural, no glucose dipping, no added sulfur or preservatives. Great natural pre-workout snack.",
    in_stock: true
  },
  {
    name: "Afghan Green Long Raisins (Kishmish)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 190,
    mrp: 240,
    unit: "250 g",
    rating: 4.8,
    reviews_count: 215,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
    description: "Slender, sun-dried green raisins with mild tangy sweetness and chewy succulent texture.",
    details: "Shade dried in mud chambers (kandahar style). Rich in natural iron and potassium.",
    in_stock: true
  },
  {
    name: "Iranian Salted & Roasted Pistachios (Pista)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 590,
    mrp: 720,
    unit: "400 g",
    rating: 4.9,
    reviews_count: 195,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Naturally smiling pistachios gently dry-roasted in Himalayan pink salt. Emerald green kernels with savory snap.",
    details: "High lutein, zeaxanthin, and B6. Clean shell opening for effortless snacking.",
    in_stock: true
  },
  {
    name: "Raw Organic Chia Seeds",
    category: "Dry Fruits, Nuts & Seeds",
    price: 160,
    mrp: 210,
    unit: "250 g",
    rating: 4.9,
    reviews_count: 280,
    image: "https://images.unsplash.com/photo-1518110925495-5fe2fda0442c?auto=format&fit=crop&w=600&q=80",
    description: "Ancient Aztec superseed that expands 10x in water, loaded with prebiotic fiber and omega-3s.",
    details: "100% raw unrefined seeds. Ideal for puddings, morning smoothies, and yogurt topping.",
    in_stock: true
  },
  {
    name: "Roasted Pumpkin Seeds with Himalayan Pink Salt",
    category: "Dry Fruits, Nuts & Seeds",
    price: 180,
    mrp: 230,
    unit: "200 g",
    rating: 4.8,
    reviews_count: 160,
    image: "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80",
    description: "Crunchy emerald pepitas packed with zinc and magnesium for immune and deep sleep support.",
    details: "Slow oven roasted without oil. Delicious keto-friendly snack.",
    in_stock: true
  },
  {
    name: "Dried Turkish Figs (Anjeer)",
    category: "Dry Fruits, Nuts & Seeds",
    price: 490,
    mrp: 610,
    unit: "300 g",
    rating: 4.9,
    reviews_count: 175,
    image: "https://images.unsplash.com/photo-1582281298055-e25b84a30b0b?auto=format&fit=crop&w=600&q=80",
    description: "Tender, honey-sweet whole sun-dried figs packed with tiny crunchy edible seeds and rich dietary iron.",
    details: "Naturally sweet without sugar syrup coating. Soak overnight in milk or water for digestive vitality.",
    in_stock: true
  },

  // Farm Honey & Country Sugars
  {
    name: "Raw Wildflower Forest Honey (Unprocessed & Unfiltered)",
    category: "Farm Honey & Country Sugars",
    price: 420,
    mrp: 520,
    unit: "500 g",
    rating: 5.0,
    reviews_count: 480,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Harvested ethically by indigenous honey hunters from wild hives in deep Nilgiri reserves. Preserves live bee pollen, propolis, and enzymes.",
    details: "Zero thermal processing, zero corn syrup or inverted sugar. Pure thick aromatic nectar with multi-floral tasting notes.",
    in_stock: true
  },
  {
    name: "Organic Pure Palm Jaggery (Karupatti)",
    category: "Farm Honey & Country Sugars",
    price: 195,
    mrp: 240,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 360,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Dark, mineral-dense jaggery boiled from fresh palmyra palm nectar. Has a rich butterscotch finish and high iron content.",
    details: "Origin: Tirunelveli palm groves. Made with zero bleaching chemicals or sulfur. The ultimate natural sweetener for herbal coffee.",
    in_stock: true
  },
  {
    name: "Country Brown Sugar (Nattu Sakkarai)",
    category: "Farm Honey & Country Sugars",
    price: 95,
    mrp: 120,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 430,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Unrefined cane sugar crystals retaining wholesome molasses minerals. Dissolves smoothly without sour aftertaste.",
    details: "Made from organically grown cane. Replaces white refined sugar 1:1 in tea, coffee, and traditional baking.",
    in_stock: true
  },
  {
    name: "Raw Jamun Blossom Monofloral Honey",
    category: "Farm Honey & Country Sugars",
    price: 450,
    mrp: 550,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 140,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Rare single-flower honey harvested when black plum (jamun) orchards are in full blossom. Mildly bitter-sweet with glycemic support.",
    details: "Recommended in Ayurveda for blood sugar management. 100% raw and bottled at room temperature.",
    in_stock: true
  },
  {
    name: "Organic Sugarcane Jaggery Powder (Gur Shakkar)",
    category: "Farm Honey & Country Sugars",
    price: 85,
    mrp: 110,
    unit: "1 kg",
    rating: 4.8,
    reviews_count: 295,
    image: "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80",
    description: "Free-flowing golden jaggery granules crafted from certified organic sugarcane juice using traditional clarifiers.",
    details: "Packed with magnesium, iron, and natural trace minerals. Ideal for daily tea and wholesome sweet dishes.",
    in_stock: true
  },

  // Artisanal Teas & Filter Coffee
  {
    name: "Nilgiri Blue Mountain Orthodox Black Tea (Whole Leaf)",
    category: "Artisanal Teas & Filter Coffee",
    price: 240,
    mrp: 295,
    unit: "250 g",
    rating: 4.9,
    reviews_count: 310,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    description: "Grown at 6,500 ft elevation in the misty Nilgiris. Produces a bright amber cup with floral citrus aroma and crisp brisk finish.",
    details: "Estate: Coonoor Single Garden. High winter-frost flush. Enjoy pure black or with a splash of milk.",
    in_stock: true
  },
  {
    name: "Kumbakonam Degree Filter Coffee Blend (80:20)",
    category: "Artisanal Teas & Filter Coffee",
    price: 260,
    mrp: 320,
    unit: "500 g",
    rating: 5.0,
    reviews_count: 530,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    description: "Signature blend of high-altitude Chikmagalur Arabica and Robusta beans roasted medium-dark, enriched with 20% French chicory.",
    details: "Gives thick aromatic decoction with rich froth and chocolatey undertone for authentic brass-davarah filter coffee.",
    in_stock: true
  },
  {
    name: "Kashmiri Shahi Kahwa Green Tea with Almonds & Saffron",
    category: "Artisanal Teas & Filter Coffee",
    price: 380,
    mrp: 460,
    unit: "150 g",
    rating: 4.9,
    reviews_count: 185,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    description: "Regal blend of fine green tea leaves infused with crushed green cardamom, cinnamon, slivered almonds, and pure Kashmiri saffron threads.",
    details: "Warming Himalayan digestive infusion with intoxicating festive aroma. Brews pale golden amber.",
    in_stock: true
  },
  {
    name: "Organic Moringa & Lemon Tulsi Herbal Infusion",
    category: "Artisanal Teas & Filter Coffee",
    price: 180,
    mrp: 225,
    unit: "100 g",
    rating: 4.8,
    reviews_count: 140,
    image: "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80",
    description: "Caffeine-free soothing wellness blend of sun-cured drumstick leaves, sacred Krishna Tulsi, and refreshing lemongrass.",
    details: "Immunity boosting and detoxifying herbal tisane. 100% loose leaf organic herbs.",
    in_stock: true
  },
  {
    name: "Cardamom & Ginger Spiced CTC Chai Mix",
    category: "Artisanal Teas & Filter Coffee",
    price: 210,
    mrp: 260,
    unit: "500 g",
    rating: 4.9,
    reviews_count: 390,
    image: "https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=600&q=80",
    description: "Robust Assam CTC tea blended with real crushed Malabar dry ginger (sonth) and Idukki green cardamom for morning kick.",
    details: "Strong malty liquor designed to brew perfect Indian kadak chai with milk and jaggery.",
    in_stock: true
  },

  // Heritage Crisps & Snacks
  {
    name: "Traditional Millet Ribbon Pakoda (Wood-Pressed Groundnut Oil)",
    category: "Heritage Crisps & Snacks",
    price: 120,
    mrp: 145,
    unit: "200 g",
    rating: 4.9,
    reviews_count: 270,
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    description: "Golden crispy ribbons made from foxtail millet and roasted gram flour, seasoned with red chilli, hing, and ajwain.",
    details: "Fried exclusively in fresh wood-pressed groundnut oil. Zero palm oil, zero trans-fats, zero food coloring.",
    in_stock: true
  },
  {
    name: "Kerala Nendran Banana Chips in Cold-Pressed Coconut Oil",
    category: "Heritage Crisps & Snacks",
    price: 140,
    mrp: 170,
    unit: "250 g",
    rating: 5.0,
    reviews_count: 620,
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    description: "Paper-thin slices of mature Nendran plantains fried golden in pure fragrant cold-pressed coconut oil with sea salt and turmeric.",
    details: "Signature crunchy snap. Sourced straight from Thrissur, Kerala. Completely fresh batch.",
    in_stock: true
  },
  {
    name: "Spicy Roasted Makhana (Foxnuts / Lotus Seeds)",
    category: "Heritage Crisps & Snacks",
    price: 160,
    mrp: 195,
    unit: "100 g",
    rating: 4.8,
    reviews_count: 215,
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    description: "Fluffy giant lotus seeds slow-roasted in pure cow ghee and tossed in tangy chaat masala and rock salt.",
    details: "Low calorie, high calcium, gluten-free super-snack. Ideal evening companion with green tea.",
    in_stock: true
  },
  {
    name: "Butter Murukku / Thenkuzhal (Melt-in-Mouth)",
    category: "Heritage Crisps & Snacks",
    price: 110,
    mrp: 135,
    unit: "200 g",
    rating: 4.9,
    reviews_count: 340,
    image: "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80",
    description: "Fragrant rice and roasted gram coils enriched with white farm butter and cumin seeds. Incredibly delicate crunch.",
    details: "Handmade by village women artisans in Manapparai. Traditional festive comfort snack.",
    in_stock: true
  },
  {
    name: "Pepper Roasted Split Cashews (Hot & Savory)",
    category: "Heritage Crisps & Snacks",
    price: 240,
    mrp: 290,
    unit: "150 g",
    rating: 4.9,
    reviews_count: 180,
    image: "https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=600&q=80",
    description: "Plump Goan cashew halves roasted with crushed Malabar black pepper and curry leaf crisps.",
    details: "Dry roasted with pure ghee and coarse sea salt. Irresistibly savory treat.",
    in_stock: true
  }
];

// Let's expand these base items across varieties to create 100+ comprehensive items
const expandedProducts = [];
let idCounter = 1001;

// First push the high-detail items
rawProducts.forEach(prod => {
  expandedProducts.push({
    "Product ID": `GS-${idCounter++}`,
    "Product Name": prod.name,
    "Category": prod.category,
    "Selling Price (INR)": prod.price,
    "MRP (INR)": prod.mrp,
    "Package Unit": prod.unit,
    "Customer Rating": prod.rating,
    "Total Reviews": prod.reviews_count,
    "Image URL": prod.image,
    "Short Description": prod.description,
    "Detailed Specifications": prod.details,
    "Stock Status": prod.in_stock ? "In Stock" : "Out of Stock"
  });
});

// Additional curated items to reach 100+ items across all categories
const extraItems = [
  // Grains & Millets
  ["Organic Proso Millet (Cheena Raw)", "Grains, Rice & Millets", 115, 140, "500 g", "High protein ancient millet for nutritious upma and grain bowls.", "Gluten-free, zero chemical polish."],
  ["Red Poha / Flattened Rice (Thick)", "Grains, Rice & Millets", 85, 105, "1 kg", "Nutritious iron-rich flattened red rice for wholesome quick breakfasts.", "Iron powerhouse, naturally sun-dried."],
  ["White Poha / Aval (Medium Thick)", "Grains, Rice & Millets", 70, 85, "1 kg", "Delicate beaten rice flakes that absorb spices and coconut milk beautifully.", "Quick cooking, light on stomach."],
  ["Ancient Emmer Khapli Wheat Grain", "Grains, Rice & Millets", 190, 230, "1 kg", "Diabetic-friendly ancient heirloom low-gluten wheat grain.", "Low GI, rich in beta glucans and minerals."],
  ["Steel Cut Organic Oats", "Grains, Rice & Millets", 175, 210, "1 kg", "Coarsely chopped whole oat groats for hearty chewy porridge.", "Unprocessed whole kernel."],
  ["Seeraga Samba Aromatic Rice", "Grains, Rice & Millets", 195, 240, "1 kg", "Tiny aromatic southern pearl rice revered for Dindigul biryani.", "Distinct earthy fragrance and easy digestion."],
  ["Bamboo Rice (Moongil Arisi)", "Grains, Rice & Millets", 320, 390, "500 g", "Rare forest seed harvested from dried flowering bamboo trees.", "High protein, joint vitality tonic."],
  ["Karuppu Kavuni Black Forbidden Rice", "Grains, Rice & Millets", 210, 260, "1 kg", "Jet-black royal rice loaded with high anthocyanin antioxidants.", "Sweet nutty fragrance, deep purple hue."],
  ["Organic Pearl Barley Grains", "Grains, Rice & Millets", 90, 115, "500 g", "Cooling mountain barley for restorative soups and detox water.", "High soluble fiber content."],
  ["Broken Wheat Dalia (Lapsi Rava)", "Grains, Rice & Millets", 80, 95, "1 kg", "Golden crushed wheat groats for breakfast khichdi and sweet lapsi.", "High dietary fiber, zero refined starch."],
  ["Organic Foxtail Millet Flour (Thinai Atta)", "Grains, Rice & Millets", 95, 115, "500 g", "Finely milled millet flour for diabetic rotis, dosas, and cookies.", "100% natural, stone ground."],
  ["Sorghum Flour (Jowar Atta)", "Grains, Rice & Millets", 75, 90, "1 kg", "Naturally gluten-free stone-ground jowar flour for soft bhakris.", "High magnesium and phosphorus."],

  // Pulses & Lentils
  ["Organic Moth Beans (Matki)", "Organic Pulses & Lentils", 125, 150, "1 kg", "Small earthy brown beans that sprout vigorously for Maharashtrian Misal.", "Rich in zinc and dietary fiber."],
  ["Split Green Moong Chilka", "Organic Pulses & Lentils", 130, 155, "1 kg", "Split moong with skin intact for fiber-rich soothing home dals.", "Retains natural mineral outer layer."],
  ["Black Eyed Peas (Lobia / Karamani)", "Organic Pulses & Lentils", 115, 140, "1 kg", "Sweet cream-colored beans with black eye, cooks fast without soaking.", "High protein, versatile in curries."],
  ["Brown Cowpeas (Thattai Payaru)", "Organic Pulses & Lentils", 105, 130, "1 kg", "Traditional rustic south Indian cowpea with deep savory flavor.", "Ideal for spicy kozhambu and sundal."],
  ["Organic Soya Chunks (High Protein)", "Organic Pulses & Lentils", 85, 105, "400 g", "Plant-based super nuggets containing 52% pure vegan protein.", "Textured defatted soy flour."],
  ["Split Bengal Gram (Chana Dal)", "Organic Pulses & Lentils", 110, 135, "1 kg", "Bright golden polished-free split chickpea dal for vada and puran poli.", "Rich in complex slow carbs."],
  ["Kashmiri White Rajma", "Organic Pulses & Lentils", 210, 255, "1 kg", "Soft, melt-in-mouth small white kidney beans from Pahalgam valley.", "Velvety texture in tomato gravy."],
  ["Panchmel Mixed 5-Dal Blend", "Organic Pulses & Lentils", 160, 195, "1 kg", "Rajasthani royal mix of Toor, Moong, Chana, Masoor, and Urad dals.", "Complete balanced amino acid profile."],
  ["Organic Green Peas Dried (Vatana)", "Organic Pulses & Lentils", 90, 110, "1 kg", "Sweet dried field peas for ragda patties, samosa filling, and chaat.", "Sun-cured natural whole peas."],
  ["Black Chickpeas Flour (Besan)", "Organic Pulses & Lentils", 95, 120, "1 kg", "100% pure chana dal besan with fine silky texture for sweets and pakodas.", "Zero gluten, zero added cornflour."],

  // Oils & Ghee
  ["Wood-Pressed Safflower Oil (Kardi)", "Cold-Pressed Oils & Pure Ghee", 380, 440, "1 Litre", "Light golden heart-friendly oil rich in linoleic polyunsaturated fats.", "Extracted in wooden ghani."],
  ["Cold-Pressed Flaxseed Oil (Linseed)", "Cold-Pressed Oils & Pure Ghee", 290, 360, "250 ml", "High-potency plant Omega-3 oil bottled raw for dressing and wellness.", "Cold-pressed below 35°C."],
  ["Pure Cow Butter (Unsalted Makkhan)", "Cold-Pressed Oils & Pure Ghee", 320, 380, "500 g", "Farm fresh cultured unsalted butter with sweet grassy pasture aroma.", "Crafted from fresh cow milk cream."],
  ["Wood-Pressed Castor Oil (Pure Erand)", "Cold-Pressed Oils & Pure Ghee", 180, 220, "500 ml", "Viscous cold-pressed pure castor oil for deep conditioning and ayurvedic care.", "Hexane-free, virgin grade."],
  ["Wood-Pressed Black Sesame Oil (Til)", "Cold-Pressed Oils & Pure Ghee", 440, 510, "1 Litre", "Dense aromatic pure sesame oil without jaggery for authentic medicinal oiling.", "Pure black sesame seed extraction."],
  ["Grass-Fed Cow Colostrum Ghee", "Cold-Pressed Oils & Pure Ghee", 1650, 1950, "300 ml", "Ultra-rare golden elixir clarified from first milk post-calving.", "Rich in immunoglobulins and growth factors."],

  // Spices & Masalas
  ["Star Anise (Chakra Phool Whole)", "Spices, Masalas & Seasonings", 160, 200, "100 g", "Fragrant eight-pointed licorice spice essential for authentic biryani.", "Whole intact hand-selected stars."],
  ["Kerala Whole Cloves (Laung)", "Spices, Masalas & Seasonings", 195, 240, "100 g", "High essential-oil cloves with large round unbroken heads.", "Origin: Wayanad spice gardens."],
  ["Mace Blades (Javitri)", "Spices, Masalas & Seasonings", 290, 360, "50 g", "Lacy scarlet aril of the nutmeg fruit with warm delicate floral aroma.", "Hand-harvested in Kerala."],
  ["Whole Nutmeg with Shell (Jaiphal)", "Spices, Masalas & Seasonings", 150, 185, "100 g", "Aromatic whole nutmegs that preserve freshness until grated.", "Deep woodsy comforting fragrance."],
  ["Black Cumin Seeds (Shahi Jeera)", "Spices, Masalas & Seasonings", 140, 175, "100 g", "Slender dark cumin with delicate sweet caraway undertones.", "Essential for royal Awadhi cuisine."],
  ["Ajwain Seeds (Carom / Omam)", "Spices, Masalas & Seasonings", 75, 95, "200 g", "Digestive powerhouse with strong thyme aroma for breads and fried snacks.", "Cleansed and de-stoned."],
  ["Fennel Seeds (Lucknowi Saunf)", "Spices, Masalas & Seasonings", 90, 115, "200 g", "Fragrant sweet green small fennel seeds for digestive refreshment.", "Naturally green, non-dyed."],
  ["Fenugreek Seeds (Methi Dana)", "Spices, Masalas & Seasonings", 55, 70, "250 g", "Golden bittersweet seeds that enhance sambar, pickles, and idli fermentation.", "Cleaned machine-sorted grade."],
  ["Whole Dry Ginger (Sonth)", "Spices, Masalas & Seasonings", 110, 140, "150 g", "Unbleached dry ginger root for winter decoctions, tea, and dry spice powders.", "Sun-dried farm ginger root."],
  ["Garam Masala Powder (Handcrafted 16-Spices)", "Spices, Masalas & Seasonings", 140, 175, "100 g", "Artisanal blend of 16 whole spices gently roasted and stone ground.", "Zero coriander/chilli padding."],
  ["Madras Sambar Podi (Traditional Blend)", "Spices, Masalas & Seasonings", 125, 155, "200 g", "Authentic grandmother recipe with roasted toor dal, coriander, and Salem turmeric.", "Gives thick homestyle aroma."],
  ["Chettinad Pepper Rasam Powder", "Spices, Masalas & Seasonings", 115, 145, "200 g", "Fiery, aromatic rasam mix with whole Malabar pepper, cumin, and curry leaves.", "Instant soul-soothing broth."],
  ["Idli Podi (Gunpowder with Ghee Aroma)", "Spices, Masalas & Seasonings", 130, 160, "200 g", "Coarse spicy condiment of roasted urad, chana dal, sesame seeds, and red chillies.", "Mix with sesame oil or ghee."],
  ["Kalonji Seeds (Black Onion Seeds)", "Spices, Masalas & Seasonings", 80, 100, "100 g", "Peppery onion-scented black seeds for naan, pickles, and herbal teas.", "Pure Nigella sativa seeds."],
  ["White Sesame Seeds (Safed Til)", "Spices, Masalas & Seasonings", 95, 120, "200 g", "Nutty hulled white sesame seeds for winter sweets, tahini, and baking.", "Machine-cleaned uniform seeds."],
  ["Dry Mango Powder (Amchur)", "Spices, Masalas & Seasonings", 85, 105, "150 g", "Sun-dried sour green mangoes ground into a tangy savory seasoning powder.", "Zero added citric acid or flour."],
  ["Kasoori Methi (Dry Fenugreek Leaves)", "Spices, Masalas & Seasonings", 65, 80, "50 g", "Fragrant shade-dried fenugreek leaves from Nagaur, Rajasthan.", "Rub between palms to release aroma."],
  ["Pure Rock Salt (Sendha Namak Coarse)", "Spices, Masalas & Seasonings", 60, 75, "1 kg", "Raw uncrushed pink halite crystals for grinders and slow brine cooking.", "Mined from Himalayan seams."],
  ["Black Salt Granules (Kala Namak)", "Spices, Masalas & Seasonings", 50, 65, "500 g", "Mineral volcanic rock salt with sulfurous tang, beloved for chaats and raitas.", "Traditional kiln-fired salt."],

  // Dry Fruits & Seeds
  ["Makhana Jumbo (Raw Foxnuts)", "Dry Fruits, Nuts & Seeds", 280, 350, "250 g", "Snow-white handpicked giant lotus seeds ready to roast at home.", "Zero cholesterol, low sodium."],
  ["Sunflower Seeds (Raw Shelled)", "Dry Fruits, Nuts & Seeds", 120, 150, "250 g", "Nutty mild seeds loaded with Vitamin E and selenium for daily vitality.", "Ready to eat or toast."],
  ["Watermelon Seeds (Magaz Raw)", "Dry Fruits, Nuts & Seeds", 140, 175, "250 g", "Creamy tender seeds used for rich Mughlai curries, gravies, and halwas.", "De-shelled kernel grade."],
  ["Flax Seeds (Alsi / Linseeds Raw)", "Dry Fruits, Nuts & Seeds", 70, 90, "250 g", "Golden brown whole flax seeds packed with soluble fiber and plant ALA.", "Great roasted for spice podis."],
  ["Mamra Almonds (Iranian Handpicked)", "Dry Fruits, Nuts & Seeds", 1100, 1350, "250 g", "Rare organic concave almonds containing over 50% natural almond oil.", "Highest natural almond nutrition."],
  ["Black Seedless Raisins (Kali Kishmish)", "Dry Fruits, Nuts & Seeds", 170, 215, "250 g", "Succulent sweet black monukka raisins packed with iron and antioxidants.", "Soak overnight for vitality."],
  ["Brazil Nuts (Selenium Powerhouse)", "Dry Fruits, Nuts & Seeds", 620, 780, "250 g", "Giant crunchy Amazon rainforest nuts; one nut supplies 100% daily selenium.", "Raw, unblanched whole nuts."],
  ["Goji Berries (Sun-Dried)", "Dry Fruits, Nuts & Seeds", 340, 420, "150 g", "Himalayan red super-berries rich in carotenoids, zeaxanthin, and Vitamin C.", "Tangy sweet chewy snack."],
  ["Dried Cranberries (Whole Fruit)", "Dry Fruits, Nuts & Seeds", 220, 280, "200 g", "Tart sweet ruby red berries for breakfast granolas, salads, and festive cakes.", "Lightly sweetened whole fruit."],

  // Honey & Sugars
  ["Neem Blossom Organic Honey", "Farm Honey & Country Sugars", 460, 560, "500 g", "Dark amber honey collected during neem tree flowering season.", "Antibacterial and blood-purifying properties."],
  ["Eucalyptus Wild Reserve Honey", "Farm Honey & Country Sugars", 390, 480, "500 g", "Distinct menthol herbal note honey harvested from Ooty eucalyptus groves.", "Soothes throat irritation and coughs."],
  ["Organic Cane Jaggery Block (Bhel Gur)", "Farm Honey & Country Sugars", 80, 100, "1 kg", "Firm golden block jaggery traditionally prepared in iron pans.", "Rich in iron, potassium, and magnesium."],
  ["Coconut Palm Sugar (Low Glycemic)", "Farm Honey & Country Sugars", 240, 295, "500 g", "Unrefined sugar dehydrated from fresh coconut blossom sap. Mild caramel notes.", "Low GI of 35, sustainable choice."],
  ["Raw Khandsari Sugar (Desi Khand)", "Farm Honey & Country Sugars", 110, 140, "1 kg", "Traditional crystallised unbleached cane sugar rich in natural molasses.", "Chemical-free alternative to table sugar."],

  // Beverages & Teas
  ["Darjeeling First Flush Whole Leaf Tea", "Artisanal Teas & Filter Coffee", 420, 520, "100 g", "The Champagne of Teas: spring harvested tender shoots with muscatel notes.", "Single estate high-altitude garden."],
  ["Assam Golden Tippy CTC Leaf Tea", "Artisanal Teas & Filter Coffee", 220, 270, "500 g", "Bold brisk full-bodied tea with golden tippy buds for rich morning cup.", "Deep ruby liquor with malty character."],
  ["Peppermint & Spearmint Herbal Leaf Tea", "Artisanal Teas & Filter Coffee", 190, 235, "100 g", "Crisp refreshing pure mint leaves that soothe digestion and freshen breath.", "100% pure dried whole mint leaves."],
  ["Pure Roasted Chicory Powder", "Artisanal Teas & Filter Coffee", 95, 120, "250 g", "French roasted and ground chicory root to customize your own filter coffee blend.", "Rich caramel body and aroma."],
  ["Organic Green Tea Whole Leaf (Gunpowder)", "Artisanal Teas & Filter Coffee", 210, 260, "200 g", "Tightly rolled green tea pearls that unfurl in hot water, loaded with EGCG.", "Gentle grassy freshness without bitterness."],
  ["Dry Ginger Coffee Mix (Sukku Kaapi)", "Artisanal Teas & Filter Coffee", 160, 195, "200 g", "Traditional herbal brew powder with dry ginger, black pepper, coriander, and tulsi.", "Instant immunity tonic with jaggery."],

  // Snacks & Crisps
  ["Kara Boondi with Peanuts & Curry Leaves", "Heritage Crisps & Snacks", 110, 135, "200 g", "Tiny crispy chickpea pearls fried golden and tossed with roasted nuts.", "Fried in cold-pressed oil."],
  ["Handmade Garlic Murukku", "Heritage Crisps & Snacks", 120, 145, "200 g", "Crispy spiral snacks infused with real crushed country garlic cloves.", "Savory garlic crunch in every bite."],
  ["Spicy Tapioca Chips (Maravalli Kizhangu)", "Heritage Crisps & Snacks", 115, 140, "200 g", "Thin wafer chips of fresh cassava root dusted with red chilli powder and salt.", "Crunchy southern street delicacy."],
  ["Roasted Salted Peanuts (Bharuchi)", "Heritage Crisps & Snacks", 95, 120, "250 g", "Clay-oven sand roasted Gujarat peanuts with red skin intact and deep crunch.", "Classic tea-time healthy protein snack."],
  ["Sweet Jaggery Banana Chips (Sharkara Varatti)", "Heritage Crisps & Snacks", 160, 195, "250 g", "Thick plantain chunks coated in ginger, cardamom, and thick palm jaggery.", "Kerala festival delicacy on Vishu & Onam."],
  ["Multi-Millet Sev (Bhavnagri Style)", "Heritage Crisps & Snacks", 115, 140, "200 g", "Melt-in-mouth thick sev crafted from ragi, jowar, and gram flour with ajwain.", "Wholesome gluten-conscious snack."],
  ["Organic Roasted Flaxseed Mukhwas", "Heritage Crisps & Snacks", 90, 115, "150 g", "Toasted flax and sesame seeds with dry roasted fennel and lemon rock salt.", "Digestive post-meal mouth freshener."],
  ["Heritage Coconut Thattai", "Heritage Crisps & Snacks", 125, 150, "200 g", "Crunchy disc crackers studded with Bengal gram, fresh coconut slivers, and curry leaves.", "Traditional wood-pressed oil fry."]
];

extraItems.forEach(item => {
  const [name, cat, price, mrp, unit, desc, details] = item;
  expandedProducts.push({
    "Product ID": `GS-${idCounter++}`,
    "Product Name": name,
    "Category": cat,
    "Selling Price (INR)": price,
    "MRP (INR)": mrp,
    "Package Unit": unit,
    "Customer Rating": Number((4.5 + Math.random() * 0.5).toFixed(1)),
    "Total Reviews": Math.floor(40 + Math.random() * 350),
    "Image URL": getCategoryFallbackImage(cat),
    "Short Description": desc,
    "Detailed Specifications": details,
    "Stock Status": "In Stock"
  });
});

function getCategoryFallbackImage(cat) {
  switch (cat) {
    case 'Grains, Rice & Millets':
      return "https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=80";
    case 'Organic Pulses & Lentils':
      return "https://images.unsplash.com/photo-1585994192701-f1a505c817ee?auto=format&fit=crop&w=600&q=80";
    case 'Cold-Pressed Oils & Pure Ghee':
      return "https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=600&q=80";
    case 'Spices, Masalas & Seasonings':
      return "https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&w=600&q=80";
    case 'Dry Fruits, Nuts & Seeds':
      return "https://images.unsplash.com/photo-1508061253366-f7da158b6d46?auto=format&fit=crop&w=600&q=80";
    case 'Farm Honey & Country Sugars':
      return "https://images.unsplash.com/photo-1587049352846-4a222e784d38?auto=format&fit=crop&w=600&q=80";
    case 'Artisanal Teas & Filter Coffee':
      return "https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=600&q=80";
    case 'Heritage Crisps & Snacks':
    default:
      return "https://images.unsplash.com/photo-1599490659213-e2b9527bd087?auto=format&fit=crop&w=600&q=80";
  }
}

// Make sure output dir exists
const dataDir = path.resolve('public/data');
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

// Build Workbook
const worksheet = XLSX.utils.json_to_sheet(expandedProducts);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Grocery Products");

const targetFile = path.join(dataDir, 'products.xlsx');
XLSX.writeFile(workbook, targetFile);

console.log(`Successfully generated ${expandedProducts.length} grocery items in ${targetFile}`);
