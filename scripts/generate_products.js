import fs from 'fs';
import path from 'path';
import XLSX from 'xlsx';

// Load manifest from local Pictures or public/products
const manifestPath = 'C:/Users/tamil/OneDrive/Pictures/Picture/manifest.json';
const rawManifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

console.log(`Loaded ${rawManifest.length} items from manifest.`);

// Detailed product definitions map keyed by index (1 to 120)
const PRODUCT_CATALOG_DETAILS = {
  1: { unit: "100 g", price: 38, mrp: 45, desc: "Pure spicy red chilli powder sun-dried and ground to perfection.", details: "100% Guntur Red Chillies. No artificial colours or preservatives." },
  2: { unit: "100 g", price: 35, mrp: 42, desc: "Golden Erode turmeric powder rich in natural curcumin.", details: "High-curcumin pure turmeric root. Traditional Salem/Erode harvest." },
  3: { unit: "100 g", price: 36, mrp: 44, desc: "Fragrant coriander powder roasted and ground for authentic gravy flavour.", details: "Selected green coriander seeds. Cold-ground aroma lock." },
  4: { unit: "100 g", price: 42, mrp: 50, desc: "Authentic South Indian sambar masala powder with traditional spices and lentils.", details: "Heritage blend of coriander, red chilli, fenugreek, toor dal, and asafoetida." },
  5: { unit: "100 g", price: 40, mrp: 48, desc: "Zesty aromatic rasam powder for steaming piping hot South Indian rasam.", details: "Rich in black pepper, cumin, coriander, and curry leaf essence." },
  6: { unit: "100 g", price: 45, mrp: 55, desc: "Special aromatic spice blend for restaurant-style Chicken curry, fry, and sukka.", details: "Contains star anise, black pepper, cloves, cinnamon, and roasted spices." },
  7: { unit: "100 g", price: 48, mrp: 58, desc: "Rich flavourful spice blend for succulent, tender mutton kuzhambu and chukka.", details: "Formulated with rustic stone-ground spices for deep aroma." },
  8: { unit: "100 g", price: 50, mrp: 60, desc: "Finest royal warm spices blend to enhance North & South Indian dishes.", details: "Cardamom, mace, cinnamon, cloves, bay leaf, and nutmeg blend." },
  9: { unit: "100 g", price: 75, mrp: 90, desc: "Freshly ground Malabar black pepper powder with intense punch and heat.", details: "100% pure black peppercorns from Western Ghats. Great for health and soups." },
  10: { unit: "100 g", price: 55, mrp: 65, desc: "Chef's secret recipe spice mix for rich, aromatic Ambur and Chettinad biryani.", details: "Blended with shahi jeera, mace, nutmeg, cardamom, and aromatic bay leaves." },
  11: { unit: "500 g", price: 190, mrp: 220, desc: "Strong hotel-style tea dust delivering rich dark decoction and brisk flavor.", details: "Fine CTC tea dust sourced from Nilgiri hill plantations." },
  12: { unit: "500 g", price: 340, mrp: 390, desc: "Rich colour and exquisite aroma tea blended with selected fresh tea leaves.", details: "Brooke Bond 3 Roses strong CTC leaf tea with signature taste." },
  13: { unit: "500 g", price: 290, mrp: 330, desc: "Tata Tea Premium blend of gentle rolled tea leaves and long leaves.", details: "Rich aromatic cup that brings warmth to your morning routine." },
  14: { unit: "500 g", price: 310, mrp: 360, desc: "Famous Red Label tea with natural care and delightful flavour.", details: "Selected Assam and Dooars teas blended for briskness and strength." },
  15: { unit: "500 g", price: 260, mrp: 300, desc: "AVT Premium dust tea, the traditional favourite in Southern households.", details: "Extra strong decoction and full-bodied classic taste." },
  16: { unit: "200 g", price: 140, mrp: 165, desc: "Traditional South Indian degree filter coffee blend with roasted chicory.", details: "80% Arabica/Robusta plantation beans and 20% French chicory." },
  17: { unit: "100 g", price: 195, mrp: 230, desc: "Authentic instant coffee made from a fine blend of coffee and chicory.", details: "Delivers a rich aroma and authentic coffee experience in seconds." },
  18: { unit: "100 g", price: 210, mrp: 250, desc: "Nescafe Classic pure instant soluble coffee granules with signature taste.", details: "100% pure roasted coffee beans from world-class estates." },
  19: { unit: "1 kg", price: 54, mrp: 60, desc: "Crystal pure sulphur-free refined white sugar with sparkling clarity.", details: "100% cane sugar, hygienic untouched packaging." },
  20: { unit: "1 kg", price: 48, mrp: 55, desc: "Clean granulated white cane sugar for daily sweets, tea, and cooking.", details: "Pure refined sugar with sparkling white grains." },
  21: { unit: "1 kg", price: 75, mrp: 90, desc: "Traditional unrefined country cane jaggery (Vellam) loaded with natural iron.", details: "Free from artificial chemicals, ideal for pongal and traditional sweets." },
  22: { unit: "500 g", price: 65, mrp: 80, desc: "Pure crystallized diamond sugar rocks, soothing for throat and refreshing.", details: "Traditional Kalkandu for sweet pongal, milk, and ayurvedic remedies." },
  23: { unit: "1 L", price: 145, mrp: 165, desc: "Refined sunflower oil enriched with Vitamin A & D, light on stomach.", details: "Non-greasy, high smoke point for crispy golden frying." },
  24: { unit: "1 L", price: 138, mrp: 155, desc: "Pure refined sunflower cooking oil for wholesome, heart-healthy family cooking.", details: "Zero cholesterol, enriched with natural Vitamin E." },
  25: { unit: "1 L", price: 195, mrp: 230, desc: "Traditional cold-pressed groundnut oil (Kadalai Ennai) with nutty aroma.", details: "Wood-pressed / filtered from premium farm groundnuts." },
  26: { unit: "1 L", price: 240, mrp: 280, desc: "Authentic cold-pressed sesame oil (Nallennai) sweetened with palm jaggery.", details: "Essential staple for Tamil kuzhambu, idli podi, and oil baths." },
  27: { unit: "1 L", price: 210, mrp: 250, desc: "Pure filtered coconut oil extracted from fresh sun-dried copra.", details: "Dual use for traditional cooking and hair nourishment." },
  28: { unit: "1 L", price: 110, mrp: 125, desc: "Refined palmolein cooking oil, economical and heat-stable for daily frying.", details: "Ideal for deep frying snacks, murukku, and street foods." },
  29: { unit: "1 L", price: 135, mrp: 155, desc: "Physically refined rice bran oil rich in natural Oryzanol for heart health.", details: "High smoke point (250°C), absorbs less oil in fried snacks." },
  30: { unit: "1 L", price: 120, mrp: 140, desc: "Sacred 5-oil Pancha Deepam oil blend with divine lingering fragrance.", details: "Blended with sesame, mahua, neem, castor, and pure cow ghee." },
  31: { unit: "200 g", price: 20, mrp: 25, desc: "Vim bar with the power of 100 lemons that slices through stubborn burnt grease.", details: "Formulated with real lemon extract and anti-germ mineral particles." },
  32: { unit: "500 ml", price: 115, mrp: 135, desc: "Concentrated lemon dishwash gel, leaves vessels sparkling clean without residue.", details: "1 spoon is enough for an entire sink full of utensils." },
  33: { unit: "250 g", price: 28, mrp: 32, desc: "Anti-bacterial round dishwash bar with ginger and lime power that prevents sogginess.", details: "Touch and shine technology that kills 99.9% utensil bacteria." },
  34: { unit: "425 ml", price: 105, mrp: 125, desc: "Kraft gel with German degreasing formula that cleans burnt food effortlessly.", details: "Active power droplets cut through oily grease with minimal scrub." },
  35: { unit: "Pack of 3", price: 35, mrp: 45, desc: "Heavy-duty nylon green scrub pad for spotless stainless steel and non-stick cookware.", details: "Durable, non-scratching synthetic scrubbing fibers." },
  36: { unit: "250 g", price: 22, mrp: 25, desc: "Rin advanced bar for dazzling, mirror-bright whiteness on school uniforms and shirts.", details: "Bright cleaning technology targets tough cuffs and collar stains." },
  37: { unit: "1 kg", price: 95, mrp: 110, desc: "Rin golden shine detergent powder with water-softening enzymes.", details: "Delivers crisp spotless whites in bucket wash and semi-automatic machines." },
  38: { unit: "1 kg", price: 165, mrp: 190, desc: "Ariel Complete with Oxi-Stain removers for tough 1-wash stain removal.", details: "Designed for brilliant results in both handwash and top load machines." },
  39: { unit: "1 L", price: 240, mrp: 280, desc: "Ariel Matic liquid detergent that dissolves instantly and protects fabric colour.", details: "Prevents fabric dullness, leaving fresh fragrance and spotless cleaning." },
  40: { unit: "1 kg", price: 150, mrp: 175, desc: "Surf Excel Easy Wash powder with super budget power to remove tough stains.", details: "Lathers smoothly in hard water and rinses away without white marks." },
  41: { unit: "1 L", price: 230, mrp: 270, desc: "Surf Excel Matic Front & Top Load liquid with active stain fighting molecules.", details: "Gentle on hands and washing machines, keeps clothes like new." },
  42: { unit: "1 kg", price: 68, mrp: 78, desc: "Active Wheel 2-in-1 powder with the fresh essence of lemon and jasmine.", details: "Budget-friendly everyday family laundry powder." },
  43: { unit: "1 kg", price: 125, mrp: 145, desc: "Tide Plus Extra Power with jasmine and rose fragrance for dazzling whites.", details: "Works fast on yellowing and stubborn turmeric/food stains." },
  44: { unit: "250 ml", price: 45, mrp: 52, desc: "Ujala Supreme 4-drop fabric whitener for ultra-violet radiant white clothes.", details: "Contains ultra-white suspension particles for crisp school and office shirts." },
  45: { unit: "860 ml", price: 225, mrp: 260, desc: "Comfort after-wash fabric conditioner with 14-day lingering floral fragrance.", details: "Softens fabric fibres, protects colour and eases ironing." },
  46: { unit: "125 g", price: 38, mrp: 42, desc: "Lifebuoy Total 10 germ protection soap with silver shield technology.", details: "Provides 100% stronger protection against sickness-causing germs." },
  47: { unit: "125 g", price: 42, mrp: 48, desc: "Original neem bath soap infused with 100% pure neem oil and Vitamin E.", details: "Clears skin blemishes, prevents prickliness, and purifies naturally." },
  48: { unit: "100 g", price: 40, mrp: 46, desc: "Lux Velvet Touch beauty soap with French rose perfume and almond oil.", details: "Rich creamy lather leaves skin soft, radiant, and beautifully scented." },
  49: { unit: "185 ml", price: 85, mrp: 99, desc: "Active silver formula handwash that cleans and kills 99.9% germs in 10 seconds.", details: "Moisturizing formula keeps hands clean, safe, and supple." },
  50: { unit: "125 g", price: 52, mrp: 60, desc: "Dettol Original bath bar trusted for clinical family germ protection.", details: "Enriched with skin moisturizers and pine antiseptic scent." },
  51: { unit: "125 g", price: 38, mrp: 45, desc: "Santoor sandalwood and turmeric soap for youthful, glowing, blemish-free skin.", details: "Traditional Ayurvedic formulation loved by Indian women for generations." },
  52: { unit: "100 g", price: 65, mrp: 75, desc: "Dove Beauty Moisture cream bar with 1/4th moisturizing milk.", details: "Gentle cleanser that doesn't dry skin like regular soaps." },
  53: { unit: "100 g", price: 45, mrp: 52, desc: "Cinthol Original soap with deodorizing protection and 99.9% germ shield.", details: "Revitalizing freshness keeps you energized all day long." },
  54: { unit: "125 g", price: 44, mrp: 50, desc: "Medimix Ayurvedic 18-herb soap that prevents body odour, acne, and rashes.", details: "Handmade soap enriched with traditional Ayurvedic herbal oils." },
  55: { unit: "125 g", price: 68, mrp: 78, desc: "Pears Pure & Gentle transparent glycerin soap for clear, soft, radiant skin.", details: "Crafted with 98% pure glycerin and natural cleansing oils." },
  56: { unit: "250 g", price: 24, mrp: 28, desc: "Traditional Tamil Nadu laundry soap bar renowned for tough collar grime removal.", details: "Dense, long-lasting bar with strong cleansing lather." },
  57: { unit: "250 g", price: 22, mrp: 25, desc: "Rin bar with brightening agents for crisp whiteness and clean hems.", details: "Formulated to target grease and soil in manual washing." },
  58: { unit: "250 g", price: 18, mrp: 22, desc: "Wheel active lemon and floral washing bar for budget everyday laundry.", details: "Quick foaming bar that rinses effortlessly in tap water." },
  59: { unit: "250 g", price: 26, mrp: 30, desc: "Tata 501 legendary heritage washing soap bar for heavy cottons and linens.", details: "Time-tested formulation that is tough on stains yet gentle on fabrics." },
  60: { unit: "300 g", price: 25, mrp: 30, desc: "Multi-utility cleaning bar for vessels, stains, and household surfaces.", details: "Concentrated grease-cutting mineral formula." },
  61: { unit: "100 g", price: 38, mrp: 45, desc: "Sakthi pure hot red chilli powder from selected farm peppers.", details: "Bold natural red hue and sizzling spiciness." },
  62: { unit: "100 g", price: 36, mrp: 42, desc: "Sakthi golden yellow turmeric powder processed hygienically in Erode.", details: "High curcumin content, completely pure and laboratory tested." },
  63: { unit: "100 g", price: 36, mrp: 44, desc: "Sakthi Dhaniya powder with fresh roasted coriander seed aroma.", details: "Thickens curries and lends irresistible natural aroma." },
  64: { unit: "100 g", price: 42, mrp: 50, desc: "Famous Sakthi Sambar Podi with the signature taste of Tamil Nadu weddings.", details: "Perfect blend of roasted lentils, chillies, cumin, and curry leaves." },
  65: { unit: "100 g", price: 40, mrp: 48, desc: "Sakthi spicy pepper rasam powder for steaming digestive rasam sadam.", details: "Laden with black pepper, cumin, garlic, and coriander." },
  66: { unit: "100 g", price: 45, mrp: 55, desc: "Sakthi Chicken Masala for authentic Southern village-style chicken gravy.", details: "Packed with aromatic whole spices ground under controlled temperatures." },
  67: { unit: "100 g", price: 48, mrp: 58, desc: "Rich spicy mutton gravy masala for tender meat gravies and sukka.", details: "Selected aromatic cloves, cinnamon, cardamom, and roasted spices." },
  68: { unit: "100 g", price: 50, mrp: 60, desc: "Premium blend of roasted warm spices to finish off delicious curries.", details: "All-natural aromatic spice mix with no artificial fillers." },
  69: { unit: "100 g", price: 75, mrp: 90, desc: "Crushed pure black pepper powder, spicy and therapeutic.", details: "Fine powdered high-pungency black peppercorns." },
  70: { unit: "100 g", price: 55, mrp: 65, desc: "Fragrant biryani masala mix for dum biryani and kuska with royal scent.", details: "Rich in star anise, mace, cardamom, and clove essence." },
  71: { unit: "100 g", price: 45, mrp: 52, desc: "All-in-one Kulambu Milagai Thool for authentic Vatha Kuzhambu and Meen Kuzhambu.", details: "Traditional home-style combo of chilli, coriander, and curry spices." },
  72: { unit: "1 kg", price: 145, mrp: 175, desc: "Long-grain aromatic royal Basmati rice with slender grains that fluff upon cooking.", details: "Aged 12 months, non-sticky and fragrant for special biryanis." },
  73: { unit: "1 kg", price: 62, mrp: 72, desc: "Fine white Ponni Pacharisi for steaming hot white rice, pongal, and tiffin.", details: "Directly sourced from Thanjavur Kaveri delta paddy fields." },
  74: { unit: "1 kg", price: 65, mrp: 75, desc: "Traditional single-boiled Ponni Puzhungal Arisi, easy on digestion and nutritious.", details: "Parboiled with husk to retain B-vitamins; firm texture." },
  75: { unit: "1 kg", price: 52, mrp: 60, desc: "Special short plump Idli Gundu Arisi for feather-soft idlis and crispy dosas.", details: "High fermentation yield, clean and stones-free sorted grains." },
  76: { unit: "1 kg", price: 68, mrp: 78, desc: "Lightweight, aromatic medium-grain rice suitable for everyday South Indian meals.", details: "Aged unpolished rice, starch-balanced and light on the belly." },
  77: { unit: "1 kg", price: 135, mrp: 160, desc: "Heirloom tiny aromatic rice grain, the soul of authentic Dindigul & Thalappakatti biryani.", details: "Native Tamil Nadu variety with rich aroma and tender bite." },
  78: { unit: "1 kg", price: 85, mrp: 100, desc: "Whole grain brown rice with nutritious bran layer intact, high in dietary fiber.", details: "Low glycemic index, ideal for diabetic-friendly wholesome diets." },
  79: { unit: "1 kg", price: 44, mrp: 52, desc: "Kaikuthal broken rice (Kuruva / Arisi Noi) for delicious upma, kanji, and payasam.", details: "Clean sorted broken rice grains that cook quickly." },
  80: { unit: "180 ml", price: 95, mrp: 110, desc: "All-purpose cleansing hair shampoo with foaming bubbles and sweet fragrance.", details: "Gentle daily scalp cleanser for all hair types." },
  81: { unit: "1 L", price: 110, mrp: 130, desc: "Disinfectant floor cleaner with fresh pine & floral scent that repels insects.", details: "Removes greasy floor stains and leaves tile surfaces shining." },
  82: { unit: "1 L", price: 65, mrp: 80, desc: "Traditional white pine phenyl disinfectant for sanitary cleaning and hygiene.", details: "Strong deodorizing action for bathrooms, floors, and drains." },
  83: { unit: "1 L", price: 195, mrp: 230, desc: "Lizol 3-in-1 surface cleaner that kills 99.9% germs with refreshing citrus scent.", details: "Safe on marble, granite, ceramic tiles, and wooden floors." },
  84: { unit: "1 L", price: 185, mrp: 215, desc: "Harpic Power Plus thick liquid that removes 100% limescale and yellow stains.", details: "Kills 99.9% toilet germs, leaving sparkling clean ceramic bowls." },
  85: { unit: "1 L", price: 175, mrp: 205, desc: "Domex fresh guard toilet disinfectant with sodium hypochlorite power.", details: "Prevents limescale buildup and bad odour for up to 72 hours." },
  86: { unit: "750 ml", price: 160, mrp: 185, desc: "Vim Lemon concentrated dishwash gel bottle with easy-pour nozzle.", details: "Cuts through oily curry stains with just a few drops in water." },
  87: { unit: "500 ml", price: 105, mrp: 120, desc: "Colin multi-surface and glass cleaner spray with shine boosters.", details: "Leaves streak-free transparent shine on mirrors, windows, and TV screens." },
  88: { unit: "500 ml", price: 210, mrp: 245, desc: "Dettol Antiseptic Disinfectant liquid for first aid, laundry, and personal hygiene.", details: "Doctor-recommended antiseptic protection for complete household care." },
  89: { unit: "500 g", price: 40, mrp: 50, desc: "High-grade chlorine bleaching powder for water purification and surface sanitization.", details: "Disinfects water tanks, drains, gutters, and outdoor paved pathways." },
  90: { unit: "Pack of 2", price: 35, mrp: 45, desc: "Dual-sided sponge scrub pad with soft absorbency and abrasive scrubbing side.", details: "Ergonomic foam grip that holds detergent soap lather efficiently." },
  91: { unit: "1 piece", price: 90, mrp: 120, desc: "Long durable natural grass / coconut broom for spotless floor sweeping.", details: "Flexible sturdy bristles that trap fine dust and hair easily." },
  92: { unit: "180 ml", price: 110, mrp: 130, desc: "Clinic Plus Strong & Long shampoo with milk protein formula for strong hair.", details: "Strengthens roots and reduces hair breakage from root to tip." },
  93: { unit: "180 ml", price: 135, mrp: 155, desc: "Sunsilk Black Shine shampoo co-created with hair experts with Amla-pearl oil.", details: "Locks in deep glossy shine and bouncy softness." },
  94: { unit: "180 ml", price: 170, mrp: 199, desc: "Head & Shoulders Cool Menthol anti-dandruff shampoo with icy tingling freshness.", details: "Clinically proven formula eliminates up to 100% visible dandruff flakes." },
  95: { unit: "180 ml", price: 165, mrp: 195, desc: "Dove Daily Moisture shampoo with Pro-Moisture complex for smooth silky locks.", details: "Protects normal hair from everyday environmental wear and tear." },
  96: { unit: "200 ml", price: 88, mrp: 100, desc: "Parachute 100% pure coconut oil made from sun-dried roasted Malabar copra.", details: "5-stage filtration process delivers untouched edible-grade coconut nourishment." },
  97: { unit: "200 ml", price: 120, mrp: 140, desc: "Navratna Ayurvedic cool hair oil with 9 therapeutic herbal ingredients.", details: "Instant relief from stress, tension, headache, and sleeplessness." },
  98: { unit: "50 g", price: 115, mrp: 135, desc: "Daily nourishing face cream with multivitamins for clear glowing skin.", details: "Lightweight non-oily formula with SPF protection against sun tan." },
  99: { unit: "150 g", price: 85, mrp: 100, desc: "Complete oral care fluoride toothpaste for cavity protection and fresh breath.", details: "Strengthens enamel and protects gums against plaque." },
  100: { unit: "Pack of 2", price: 50, mrp: 65, desc: "Medium zig-zag bristles toothbrush with tongue cleaner for deep dental hygiene.", details: "Flexible neck reaches back teeth effortlessly." },
  101: { unit: "1 piece", price: 45, mrp: 60, desc: "Soft exfoliating mesh body scrubber loofah for luxurious soapy shower foam.", details: "Gentle on sensitive skin, removes dead cells and increases blood flow." },
  102: { unit: "1 kg", price: 165, mrp: 185, desc: "Sun-dried unpolished Toor Dal (Thuvaram Paruppu) with rich nutty aroma.", details: "High protein, cooks into thick golden sambar and kootu." },
  103: { unit: "1 kg", price: 150, mrp: 175, desc: "Whole white unpolished Urad Dal (Ulutham Paruppu) for fluffy idli batter and medu vada.", details: "Excellent batter rising power, high dietary fiber and protein." },
  104: { unit: "1 kg", price: 130, mrp: 150, desc: "Yellow split Moong Dal (Paasi Paruppu), gentle on stomach and nutrient dense.", details: "Quick cooking lentil for ven pongal, dal tadka, and payasam." },
  105: { unit: "1 kg", price: 105, mrp: 125, desc: "Golden Bengal Gram dal (Kadalai Paruppu) for crispy masala vadai and chutneys.", details: "Clean stone-sorted grains with rich earthy sweetness." },
  106: { unit: "1 kg", price: 120, mrp: 140, desc: "Whole green Moong beans (Pachai Payaru) for nutritious sprouting and sundal.", details: "100% whole grain with fiber-rich green skin intact." },
  107: { unit: "100 g", price: 95, mrp: 115, desc: "Whole bold black peppercorns (Milagu) with pungent aroma and medicinal benefits.", details: "Sun-dried natural Malabar black pepper." },
  108: { unit: "100 g", price: 65, mrp: 80, desc: "Aromatic Jeera seeds (Seeragam) that crackle in hot oil with warm earthiness.", details: "Essential spice for digestive rasam, tadka, and jeera rice." },
  109: { unit: "100 g", price: 25, mrp: 30, desc: "Small pungent black mustard seeds (Kadugu) for traditional South Indian tempering.", details: "Pops vigorously in hot oil to release pungent nutty aroma." },
  110: { unit: "100 g", price: 25, mrp: 30, desc: "Golden brown Methi seeds (Vendhayam) that lend subtle bitterness and coolness.", details: "Essential for idli batter soft texture, vatha kuzhambu, and fish curry." },
  111: { unit: "500 g", price: 85, mrp: 105, desc: "Seedless sour Country Tamarind (Puli) with deep brown hue and tangy kick.", details: "Cleaned and deseeded, gives authentic body to sambar and kuzhambu." },
  112: { unit: "1 kg", price: 22, mrp: 25, desc: "Refined iodized crystal/table salt for everyday culinary seasoning.", details: "Vacuum-evaporated pure salt enriched with essential dietary iodine." },
  113: { unit: "500 g", price: 58, mrp: 70, desc: "Pure stone-ground chana dal Kadalai Maavu for golden bhajis, pakoras, and laddu.", details: "Finely milled 100% chana dal flour with no added wheat." },
  114: { unit: "1 kg", price: 52, mrp: 62, desc: "Fine all-purpose refined wheat flour for parottas, snacks, and baking.", details: "Smooth consistency and high stretch elasticity." },
  115: { unit: "1 kg", price: 58, mrp: 68, desc: "100% Whole Wheat Chakki Atta for ultra-soft, fluffy phulkas and rotis.", details: "Milled with wheat bran and germ for maximum natural fiber." },
  116: { unit: "500 g", price: 38, mrp: 45, desc: "Roasted wheat semolina (Rava) for fluffy upma, rava dosa, and rich kesari.", details: "Coarse golden granules that never turn sticky when boiled." },
  117: { unit: "500 g", price: 42, mrp: 50, desc: "Hard wheat roasted semiya for delicious breakfast upma and festive payasam.", details: "Non-sticky, quick-cooking slender vermicelli strands." },
  118: { unit: "100 g", price: 35, mrp: 42, desc: "Traditional Tamil crispy urad dal Appalam that puffs wide in hot oil.", details: "Crisp, crunchy, and seasoned with salt and cumin." },
  119: { unit: "300 g", price: 65, mrp: 80, desc: "Tangy spicy mango/lemon pickle (Oorugai) aged in cold-pressed sesame oil.", details: "Traditional granny recipe with mustard, fenugreek, and fiery chilli." },
  120: { unit: "200 g", price: 45, mrp: 55, desc: "Spicy pepper urad dal papad, sun-dried and ready to roast or fry.", details: "Spiced with crushed black pepper and hing." }
};

// Ratings generation based on stable index
function getRating(idx) {
  const ratings = [4.8, 4.9, 4.7, 4.9, 4.8, 4.6, 4.8, 4.9, 4.7, 4.8];
  return ratings[idx % ratings.length];
}

function getReviews(idx) {
  return 85 + ((idx * 17) % 360);
}

const products = rawManifest.map((item) => {
  const details = PRODUCT_CATALOG_DETAILS[item.index] || {
    unit: "1 unit",
    price: 99,
    mrp: 120,
    desc: `${item.name} - authentic grocery essential for your family.`,
    details: "Hygienically packed. Store in a cool, dry place."
  };

  const id = `GS-${1000 + item.index}`;
  const image = `products/${item.file}`;
  const fallbackImage = item.source || '';

  return {
    id,
    name: item.name,
    category: item.category,
    price: details.price,
    mrp: details.mrp,
    unit: details.unit,
    rating: getRating(item.index),
    reviewsCount: getReviews(item.index),
    image,
    fallbackImage,
    description: details.desc,
    details: details.details,
    inStock: true
  };
});

// 1. Generate src/data/seedProducts.js
const seedContent = `export const SEED_PRODUCTS = ${JSON.stringify(products, null, 2)};\n`;
fs.writeFileSync(path.resolve('src/data/seedProducts.js'), seedContent, 'utf8');
console.log(`Generated src/data/seedProducts.js with ${products.length} products.`);

// 2. Generate public/data/products.xlsx
const excelRows = products.map(p => ({
  "Product ID": p.id,
  "Product Name": p.name,
  "Category": p.category,
  "Selling Price (INR)": p.price,
  "MRP (INR)": p.mrp,
  "Package Unit": p.unit,
  "Customer Rating": p.rating,
  "Total Reviews": p.reviewsCount,
  "Image URL": p.image,
  "Short Description": p.description,
  "Detailed Specifications": p.details,
  "Stock Status": p.inStock ? "In Stock" : "Out of Stock"
}));

const worksheet = XLSX.utils.json_to_sheet(excelRows);
const workbook = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(workbook, worksheet, "Grocery Products");

const excelPath = path.resolve('public/data/products.xlsx');
XLSX.writeFile(workbook, excelPath);
console.log(`Generated ${excelPath} with ${excelRows.length} items.`);
